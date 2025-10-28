"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const credentialFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["API_KEY", "DATABASE", "OAUTH2", "BASIC_AUTH", "BEARER_TOKEN", "CUSTOM"]),
  description: z.string().optional(),
  data: z.record(z.string(), z.unknown()),
});

type CredentialFormData = z.infer<typeof credentialFormSchema>;

interface CredentialFormProps {
  onSubmit: (data: CredentialFormData) => void;
  defaultValues?: Partial<CredentialFormData>;
  mode?: "create" | "edit";
}

export function CredentialForm({ onSubmit, defaultValues, mode = "create" }: CredentialFormProps) {
  const form = useForm<CredentialFormData>({
    resolver: zodResolver(credentialFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      type: defaultValues?.type || "API_KEY",
      description: defaultValues?.description || "",
      data: defaultValues?.data || {},
    },
  });

  const selectedType = form.watch("type");

  const handleSubmit = (data: CredentialFormData) => {
    onSubmit(data);
  };

  const renderCredentialDataFields = () => {
    if (!selectedType) return null;

    return (
      <FormField
        control={form.control}
        name="data"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Credential Data</FormLabel>
            <FormDescription>
              {selectedType === "API_KEY" && "Enter your API key"}
              {selectedType === "DATABASE" && "Enter your database connection details"}
              {selectedType === "OAUTH2" && "Enter your OAuth2 application details"}
              {selectedType === "BASIC_AUTH" && "Enter your basic authentication credentials"}
              {selectedType === "BEARER_TOKEN" && "Enter your bearer token"}
              {selectedType === "CUSTOM" && "Enter custom credential data as JSON"}
            </FormDescription>
            {selectedType === "CUSTOM" ? (
              <Textarea
                placeholder="Enter JSON data..."
                value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    field.onChange(parsed);
                  } catch {
                    field.onChange({});
                  }
                }}
              />
            ) : (
              <div className="space-y-4">
                {selectedType === "API_KEY" && (
                  <FormField
                    control={form.control}
                    name="data.apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter API key"
                            value={(field.value as string) || ''}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {selectedType === "DATABASE" && (
                  <>
                    <FormField
                      control={form.control}
                      name="data.host"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Host</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter host"
                              value={(field.value as string) || ''}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="data.port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Port</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter port"
                              value={(field.value as string) || ''}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="data.database"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Database</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter database name"
                              value={(field.value as string) || ''}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="data.username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter username"
                              value={(field.value as string) || ''}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="data.password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter password"
                              value={(field.value as string) || ''}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                {selectedType === "OAUTH2" && (
                  <>
                    <FormField
                      control={form.control}
                      name="data.clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client ID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter client ID"
                              value={(field.value as string) || ''}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="data.clientSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Secret</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter client secret"
                              value={(field.value as string) || ''}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="data.authUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Auth URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter auth URL"
                              value={(field.value as string) || ''}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="data.tokenUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter token URL"
                              value={(field.value as string) || ''}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                {selectedType === "BASIC_AUTH" && (
                  <>
                    <FormField
                      control={form.control}
                      name="data.username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter username"
                              value={(field.value as string) || ''}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="data.password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter password"
                              value={(field.value as string) || ''}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                {selectedType === "BEARER_TOKEN" && (
                  <FormField
                    control={form.control}
                    name="data.token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter token"
                            value={(field.value as string) || ''}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter credential name" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name for this credential
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select credential type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="API_KEY">API Key</SelectItem>
                  <SelectItem value="DATABASE">Database</SelectItem>
                  <SelectItem value="OAUTH2">OAuth2</SelectItem>
                  <SelectItem value="BASIC_AUTH">Basic Auth</SelectItem>
                  <SelectItem value="BEARER_TOKEN">Bearer Token</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a description for this credential"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A brief description of what this credential is used for
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {renderCredentialDataFields()}

        <Button type="submit" className="w-full">
          {mode === "create" ? "Create Credential" : "Update Credential"}
        </Button>
      </form>
    </Form>
  );
}