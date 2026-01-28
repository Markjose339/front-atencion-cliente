"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, Package, Ticket } from "lucide-react"

import { TicketSchema, TicketSchemaType } from "@/lib/schemas/ticket.schema"
import { useTicketsMutation } from "@/hooks/use-tickets"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

import {
  Field,
  FieldContent,
  FieldDescription as ChoiceDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"

const DEFAULT_VALUES: TicketSchemaType = {
  packageCode: "",
  type: "REGULAR",
}

export function TicketCreate() {
  const [loading, setLoading] = useState(false)
  const { create } = useTicketsMutation()

  const form = useForm<TicketSchemaType>({
    resolver: zodResolver(TicketSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const onSubmit = async (values: TicketSchemaType) => {
    setLoading(true)

    toast
      .promise(create.mutateAsync(values), {
        loading: "Generando ticket...",
        success: () => {
          form.reset(DEFAULT_VALUES)
          setLoading(false)
          return "Ticket creado exitosamente"
        },
        error: () => {
          setLoading(false)
          form.reset(DEFAULT_VALUES)
          return "Error al crear el ticket. Intente nuevamente."
        },
      })
  }

  return (
    <Card className="mx-auto w-full max-w-md shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Nuevo Ticket</CardTitle>
        </div>
        <CardDescription>
          Complete los datos para generar un ticket de atención
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="packageCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Código de paquete
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="PAQ-2024-001"
                      className="font-mono tracking-wide"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de ticket</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={loading}
                      className="space-y-2"
                    >
                      <ChoiceCard
                        id="ticket-regular"
                        value="REGULAR"
                        title="Regular"
                        description="Atención normal en orden de llegada"
                        selected={field.value === "REGULAR"}
                      />

                      <ChoiceCard
                        id="ticket-preferential"
                        value="PREFERENTIAL"
                        title="Preferencial"
                        description="Atención prioritaria para casos especiales"
                        selected={field.value === "PREFERENTIAL"}
                      />
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => form.reset(DEFAULT_VALUES)}
                disabled={loading}
              >
                Limpiar
              </Button>

              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando
                  </>
                ) : (
                  <>
                    <Ticket className="mr-2 h-4 w-4" />
                    Generar ticket
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

interface ChoiceCardProps {
  id: string
  value: "REGULAR" | "PREFERENTIAL"
  title: string
  description: string
  selected: boolean
}

function ChoiceCard({
  id,
  value,
  title,
  description,
  selected,
}: ChoiceCardProps) {
  return (
    <FieldLabel htmlFor={id}>
      <Field
        orientation="horizontal"
        className={`
          cursor-pointer rounded-lg border p-3 transition
          ${selected ? "border-primary bg-muted/50" : "hover:bg-muted/50"}
        `}
      >
        <FieldContent>
          <FieldTitle>{title}</FieldTitle>
          <ChoiceDescription>{description}</ChoiceDescription>
        </FieldContent>

        <RadioGroupItem id={id} value={value} />
      </Field>
    </FieldLabel>
  )
}
