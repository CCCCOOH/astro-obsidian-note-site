import { defineCollection, z } from 'astro:content';

const notesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    date: z.string().or(z.date()).transform(d => typeof d === 'string' ? d : d.toISOString().split('T')[0]).optional(),
    tags: z.array(z.string()).optional().catch([]),
  }),
});

export const collections = {
  notes: notesCollection,
};
