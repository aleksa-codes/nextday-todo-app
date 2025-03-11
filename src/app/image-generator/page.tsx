'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
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
  'A majestic mountain landscape at sunset with golden light and dramatic clouds',
  'A futuristic city with flying cars and neon lights at night',
  'A serene beach with crystal clear turquoise water and palm trees',
  'A magical forest with glowing mushrooms and a small cottage',
  'An ancient temple covered in vines and moss in the jungle',
  'A cyberpunk street market with holographic signs and diverse characters',
  'A cozy coffee shop interior with warm lighting and steam rising from cups',
  'An underwater scene with colorful coral reef and tropical fish',
  'A fantasy castle on a floating island in the clouds',
  'A post-apocalyptic cityscape with nature reclaiming abandoned buildings',
  'A steampunk airship flying through a stormy sky',
  'A tranquil Japanese garden with cherry blossoms and a small pond',
  'A cosmic scene with planets, nebulas, and stars in vibrant colors',
  'A medieval village with half-timbered houses and a marketplace',
  'An enchanted library with books floating in the air and magical lights',
  'A winter wonderland with snow-covered trees and northern lights',
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
  steps: z.number().int().min(1).max(8).default(4),
});

type FormValues = z.infer<typeof formSchema>;

export default function ImageGeneratorPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [examplePrompts, setExamplePrompts] = useState<string[]>(() => getRandomPrompts(EXAMPLE_PROMPTS, 3));

  // Fetch user balance
  const { data: balance = 0 } = useBalance();

  // Get subtract balance mutation
  const subtractBalance = useSubtractBalance();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
      steps: 4,
    },
  });

  // Get random prompts from the example list
  function getRandomPrompts(prompts: string[], count: number): string[] {
    const shuffled = [...prompts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

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

  const currentCreditCost = calculateCreditCost(form.watch('steps'));

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
            <Sparkles className='h-5 w-5 text-blue-500' />
            <CardTitle>AI Image Generator</CardTitle>
          </div>
          <CardDescription>
            Create stunning images with Cloudflare AI by describing what you want to see.
          </CardDescription>
        </CardHeader>

        <CardContent className='p-4 sm:p-6'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Example prompts section */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-1.5'>
                    <Lightbulb className='h-4 w-4 text-amber-500' />
                    <span className='text-sm font-medium'>Example Prompts</span>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={refreshExamplePrompts}
                    className='h-8 px-2 hover:cursor-pointer'
                  >
                    <RefreshCw className='mr-1 h-3.5 w-3.5' />
                    <span className='text-xs'>Refresh</span>
                  </Button>
                </div>

                <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
                  {examplePrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      type='button'
                      variant='outline'
                      className='h-auto justify-start px-3 py-2 text-left text-xs whitespace-normal hover:cursor-pointer'
                      onClick={() => selectExamplePrompt(prompt)}
                    >
                      <span className='line-clamp-2'>{prompt}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name='prompt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-1'>
                      Prompt{' '}
                      <Badge variant='outline' className='ml-1 font-normal'>
                        required
                      </Badge>
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
                        disabled={mutation.isPending || balance < currentCreditCost || !form.getValues().prompt}
                        className='w-full hover:cursor-pointer sm:flex-1'
                        size='lg'
                      >
                        {mutation.isPending ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Generating...
                          </>
                        ) : balance < currentCreditCost ? (
                          <>
                            <AlertTriangle className='mr-2 h-4 w-4' />
                            Insufficient Credits
                          </>
                        ) : (
                          <>
                            <ImageIcon className='mr-2 h-4 w-4' />
                            Generate Image
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top' align='center' className='max-w-[250px] text-center'>
                      {mutation.isPending
                        ? 'Please wait while we create your image'
                        : !form.getValues().prompt
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
                      <Download className='mr-2 h-4 w-4' /> Download
                    </Button>
                  </div>
                </div>
                <div className='bg-muted/50 mt-4 w-full rounded-md p-3'>
                  <p className='text-sm break-words'>
                    <span className='font-semibold'>Prompt:</span> &quot;{generatedPrompt}&quot;
                  </p>
                  <div className='text-muted-foreground xs:flex-row xs:justify-between mt-2 flex flex-col gap-1 text-xs'>
                    <span>Quality Level: {form.getValues().steps} • Model: Flux-1-Schnell</span>
                    <span>Cost: {currentCreditCost} credits</span>
                  </div>
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
