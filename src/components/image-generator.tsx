'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import { useMutation } from '@tanstack/react-query';
import { Loader2, AlertTriangle, Image as ImageIcon, Sparkles, Download, RefreshCw, Lightbulb } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { useBalance, useSubtractBalance } from '@/lib/mutations';

const EXAMPLE_PROMPTS = [
  'A majestic mountain landscape at sunset, with jagged peaks bathed in golden light, dramatic cirrus clouds reflecting a fiery orange sky, and a winding river snaking through the valley.',
  'A futuristic cyberpunk city at night, with towering skyscrapers illuminated by neon signs, flying cars weaving through holographic advertisements, and rain-slicked streets reflecting the vibrant lights.',
  'A serene tropical beach with crystal-clear turquoise water lapping gently against white sand, swaying palm trees casting long shadows, and a vibrant coral reef visible just beneath the surface.',
  'A magical enchanted forest at twilight, with bioluminescent mushrooms casting an ethereal glow, a small moss-covered cottage nestled among ancient trees, and fireflies flickering in the twilight.',
  'An ancient Mayan temple deep within a lush jungle, its stone facade covered in thick vines and vibrant green moss, sunlight filtering through the dense canopy, illuminating intricate carvings.',
  'A bustling cyberpunk street market in a crowded alleyway, holographic signs flickering above vendors selling exotic wares, diverse characters with cybernetic enhancements, and steam rising from food stalls.',
  'A cozy and warm coffee shop interior, with soft ambient lighting, steam swirling from freshly brewed coffee cups, patrons reading books in comfortable armchairs, and the aroma of roasted beans filling the air.',
  "An underwater scene in a vibrant coral reef, with schools of colorful tropical fish swimming among intricate coral formations, sunlight filtering through the water's surface, and sea turtles gracefully gliding by.",
  "A fantastical castle perched atop a floating island in the clouds, with towering spires reaching towards the heavens, a rainbow arcing across the sky, and waterfalls cascading down from the island's edges.",
  'A post-apocalyptic cityscape overgrown with nature, abandoned skyscrapers covered in vines and foliage, sunlight filtering through broken windows, and wildlife reclaiming the urban ruins.',
  'A massive steampunk airship soaring through a stormy sky, its brass and copper components gleaming in the lightning flashes, gears turning, and steam billowing from its engines.',
  'A tranquil Japanese Zen garden in spring, with delicate cherry blossoms blooming around a serene pond, a stone lantern casting a soft glow, and raked gravel creating intricate patterns.',
  'A breathtaking cosmic scene with swirling nebulas in vibrant hues of purple, blue, and pink, distant planets with rings and moons, and a shower of stardust illuminating the vast expanse of space.',
  'A bustling medieval village marketplace, with half-timbered houses lining cobblestone streets, vendors selling their wares, knights in shining armor strolling through the crowd, and a lively atmosphere.',
  'An enchanted library with towering shelves filled with ancient tomes, books floating in mid-air illuminated by magical orbs, a grand staircase leading to hidden chambers, and a wise old wizard studying a mystical manuscript.',
  'A winter wonderland scene, with snow-covered pine trees glistening under the moonlight, the aurora borealis dancing across the night sky, a cozy log cabin nestled in the snowy landscape, and a gentle snowfall.',
  'A photorealistic close up of a dew covered spider web in the early morning, with each droplet reflecting the rising sun.',
  'A stylized pixel art of a lone robot wandering through a desolate desert landscape, with a retro color palette and a nostalgic atmosphere.',
  'An impressionistic painting of a field of sunflowers swaying in the breeze, with vibrant brushstrokes and a focus on light and color.',
  'A surreal dreamscape with melting clocks, floating objects, and distorted perspectives, inspired by the works of Salvador Dalí.',
  'A detailed illustration of a dragon perched on a rocky cliff overlooking a vast valley, with scales shimmering in the sunlight and smoke billowing from its nostrils.',
  'A low poly rendering of a lush, vibrant jungle with a hidden waterfall and ancient ruins.',
  'A isometric view of a fantasy tavern filled with adventurers, with a roaring fireplace, wooden tables, and a bard playing a lute.',
  'A cinematic shot of a lone astronaut floating in the vastness of space, with Earth visible in the distance and stars twinkling in the darkness.',
  'A macro photograph of a butterfly wing, with intricate patterns and vibrant colors visible in sharp detail.',
  'A digital painting of a phoenix rising from ashes, with fiery wings and a determined expression.',
  'A close up of a human eye reflecting a galaxy.',
  'A photorealistic image of a vintage pocket watch, with intricate gears and a polished surface.',
];

const formSchema = z.object({
  prompt: z
    .string()
    .min(3, {
      message: 'Prompt must be at least 3 characters.',
    })
    .max(2048, {
      message: 'Prompt must be less than 2048 characters.',
    }),
  steps: z.number().int().min(1).max(8),
});

type FormValues = z.infer<typeof formSchema>;

export default function ImageGenerator() {
  // Add a client-side rendering flag
  const [isClient, setIsClient] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [generatedSeed, setGeneratedSeed] = useState<number | null>(null);

  // Initialize with an empty array to prevent hydration mismatch
  const [examplePrompts, setExamplePrompts] = useState<string[]>([]);

  // Fetch user balance
  const { data: balance = 0, isLoading: isBalanceLoading } = useBalance();

  // Get subtract balance mutation
  const subtractBalance = useSubtractBalance();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
      steps: 4,
    },
  });

  // Watch form values for reactive updates
  const watchedPrompt = useWatch({ control: form.control, name: 'prompt' });
  const watchedSteps = useWatch({ control: form.control, name: 'steps' });

  // Get random prompts from the example list
  function getRandomPrompts(prompts: string[], count: number): string[] {
    const shuffled = [...prompts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Use useEffect to set the example prompts on client-side only
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExamplePrompts(getRandomPrompts(EXAMPLE_PROMPTS, 3));
    setIsClient(true);
  }, []);

  // Refresh the example prompts
  const refreshExamplePrompts = useCallback(() => {
    setExamplePrompts(getRandomPrompts(EXAMPLE_PROMPTS, 3));
  }, []);

  // Set the input value to the selected example prompt
  const selectExamplePrompt = useCallback(
    (prompt: string) => {
      form.setValue('prompt', prompt);
    },
    [form],
  );

  // Define credit cost as a simple calculation: step * 20
  const calculateCreditCost = (steps: number): number => {
    return steps * 20; // Simple calculation: Each step costs 20 credits
  };

  const currentCreditCost = calculateCreditCost(watchedSteps);

  const generateImage = async (data: FormValues) => {
    // Check if user has enough credits
    if (balance < currentCreditCost) {
      throw new Error(`Insufficient credits. You need ${currentCreditCost} credits for this operation.`);
    }

    // Create FormData and append prompt and steps
    const formData = new FormData();
    formData.append('prompt', data.prompt);
    formData.append('steps', data.steps.toString());

    const response = await fetch('/api/img-gen', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate image');
    }

    const result = await response.json();

    // Save the prompt for display
    setGeneratedPrompt(data.prompt);

    // Save the seed for display
    if (result.seed !== undefined) {
      setGeneratedSeed(result.seed);
    }

    // Extract the base64 image data from the response
    if (result.image) {
      // Subtract credits after successful generation
      await subtractBalance.mutateAsync({
        userId: result.userId || 'current', // Use actual user ID from result or 'current' as fallback
        amount: currentCreditCost,
      });

      return result.image;
    } else {
      throw new Error('No image was generated');
    }
  };

  const mutation = useMutation({
    mutationFn: generateImage,
    onSuccess: (data) => {
      setImageUrl(data);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
      setImageUrl(null);
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  const handleDownload = () => {
    if (!imageUrl) return;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='w-full'>
      <Card className='overflow-hidden'>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30'>
          <div className='flex items-center gap-2'>
            <Sparkles className='text-chart-2 h-5 w-5' />
            <CardTitle>AI Image Generator (testing credits)</CardTitle>
          </div>
          <CardDescription>
            Create stunning images with Flux powered by Cloudflare AI, describe your vision and let the AI bring it to
            life.
          </CardDescription>
        </CardHeader>

        <CardContent className='p-4 sm:p-6'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Example prompts section */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-1.5'>
                    <Lightbulb className='text-warning h-4 w-4' />
                    <span className='text-sm font-medium'>Example Prompts</span>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={refreshExamplePrompts}
                    className='h-8 px-2 hover:cursor-pointer'
                  >
                    <RefreshCw className='h-3.5 w-3.5' />
                    <span className='text-xs'>Refresh</span>
                  </Button>
                </div>

                <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
                  {isClient &&
                    examplePrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        type='button'
                        variant='outline'
                        className='h-full px-3 py-2 text-left text-sm whitespace-normal hover:cursor-pointer'
                        onClick={() => selectExamplePrompt(prompt)}
                      >
                        <span>{prompt}</span>
                      </Button>
                    ))}

                  {/* Display skeleton loaders while client-side rendering is in progress */}
                  {!isClient &&
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className='bg-muted h-14 animate-pulse rounded-md' />
                    ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name='prompt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-1'>
                      Prompt
                      <span className='text-destructive font-black'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='A beautiful sunset over the mountains with birds flying'
                        {...field}
                        className='min-h-[60px] resize-y'
                      />
                    </FormControl>
                    <FormDescription className='xs:flex-row flex flex-col justify-between'>
                      <span>Describe the image you want to generate.</span>
                      <span className='text-muted-foreground xs:mt-0 mt-1 text-xs'>{field.value.length}/2048</span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='steps'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <div className='flex items-center gap-2'>
                        <FormLabel className='mb-0'>Steps</FormLabel>
                        <Badge variant='secondary' className='font-mono'>
                          {field.value}
                        </Badge>
                      </div>
                      <Badge variant='outline'>Cost: {calculateCreditCost(field.value)} credits</Badge>
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={8}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(vals: number[]) => field.onChange(vals[0])}
                        className='py-4'
                      />
                    </FormControl>
                    <div className='text-muted-foreground flex w-full justify-between px-1 text-xs'>
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                    <FormDescription className='mt-2'>
                      Higher quality levels produce better images but cost more credits.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex flex-col gap-3 pt-2 sm:flex-row'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type='submit'
                        disabled={mutation.isPending || balance < currentCreditCost || !watchedPrompt}
                        className='w-full hover:cursor-pointer sm:flex-1'
                        size='lg'
                      >
                        {mutation.isPending ? (
                          <>
                            <Loader2 className='animate-spin' />
                            Generating...
                          </>
                        ) : !isClient ? (
                          <>
                            <Loader2 className='animate-spin' />
                            Loading...
                          </>
                        ) : !isBalanceLoading && balance < currentCreditCost ? (
                          <>
                            <AlertTriangle />
                            Insufficient Credits
                          </>
                        ) : (
                          <>
                            <ImageIcon />
                            Generate Image
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top' align='center' className='max-w-[250px] text-center'>
                      {mutation.isPending
                        ? 'Please wait while we create your image'
                        : !watchedPrompt
                          ? 'Please enter a prompt or select an example'
                          : balance < currentCreditCost
                            ? `You need ${currentCreditCost} credits to generate this image`
                            : `This will use ${currentCreditCost} credits from your balance`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </form>
          </Form>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='mt-6'>
              <Alert variant='destructive'>
                <AlertTriangle className='h-4 w-4' />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {mutation.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='mt-8'>
              <div className='flex flex-col items-center justify-center rounded-lg border border-dashed p-8 sm:p-12'>
                <Loader2 className='text-primary mb-4 h-10 w-10 animate-spin sm:h-12 sm:w-12' />
                <p className='text-muted-foreground text-center text-sm'>
                  Creating your masterpiece... This may take a few moments.
                </p>
              </div>
            </motion.div>
          )}

          {imageUrl && !mutation.isPending && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className='mt-8'
            >
              <Separator className='my-4 sm:my-6' />
              <div className='flex flex-col items-center'>
                <div className='group relative flex w-fit justify-center'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt='Generated image'
                    className='max-h-[350px] w-auto rounded-lg border object-contain shadow-md sm:max-h-[500px]'
                  />
                  <div className='bg-background group-hover:bg-background/80 absolute inset-0 flex items-center justify-center rounded-lg opacity-0 transition-all group-hover:opacity-100'>
                    <Button variant='default' className='hover:cursor-pointer' onClick={handleDownload}>
                      <Download className='h-4 w-4' /> Download
                    </Button>
                  </div>
                </div>
                <div className='bg-muted/50 mt-4 w-full space-y-2 rounded-md p-3'>
                  <p className='text-sm break-words'>
                    <span className='font-semibold'>Prompt:</span> &quot;{generatedPrompt}&quot;
                  </p>
                  {generatedSeed !== null && (
                    <p className='text-sm'>
                      <span className='font-semibold'>Seed:</span> {generatedSeed}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
        <CardFooter className='text-muted-foreground bg-muted/20 flex justify-between px-4 py-3 text-xs sm:px-6'>
          <p>Powered by Cloudflare AI</p>
          <p>Using Flux-1-Schnell model</p>
        </CardFooter>
      </Card>
    </div>
  );
}
