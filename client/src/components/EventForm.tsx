import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Heart, Users, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertEventSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const categoryOptions = [
  { value: "event", label: "Event", icon: Calendar, color: "text-purple-500" },
  { value: "dating", label: "Dating", icon: Heart, color: "text-red-500" },
  { value: "friendship", label: "Friendship", icon: Users, color: "text-blue-500" },
];

const locationOptions = [
  "Çankaya",
  "Bilkent", 
  "Kızılay",
  "Ulus",
  "Bahçelievler",
  "Beşevler",
  "Ostim",
];

export function EventForm() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      date: "",
      time: "",
      image: "",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/events", data);
    },
    onSuccess: () => {
      toast({
        title: "Event Created!",
        description: "Your event is live and people can join.",
      });
      form.reset();
      setSelectedCategory("");
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "An error occurred while creating the event.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createEventMutation.mutate({
      ...data,
      category: selectedCategory,
    });
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Create New Event</h2>
        <p className="text-gray-600">Start meeting people around you</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-800">Event Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Coffee & Chat"
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categoryOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`p-3 border-2 rounded-xl text-center transition-colors ${
                      selectedCategory === option.value
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                    onClick={() => {
                      setSelectedCategory(option.value);
                      form.setValue("category", option.value as any);
                    }}
                  >
                    <Icon className={`${option.color} text-xl mb-2 mx-auto`} />
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-800">Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell about your event details..."
                    rows={3}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-800">Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-800">Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-800">Location</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locationOptions.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={createEventMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-xl font-semibold text-lg transition-transform active:scale-95"
          >
            {createEventMutation.isPending ? "Creating..." : "Create Event"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
