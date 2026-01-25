"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cadastrarCliente } from "@/app/dashboard/clientes/actions/cadastrarCliente";
import { useState } from "react";

const schema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
});

type FormData = z.infer<typeof schema>;


export function NovoClienteModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  async function onSubmit(data: FormData) {
    const formData = new FormData();
    formData.append("nome", data.nome);
    const result = await cadastrarCliente(formData);
    if (result?.error) {
      setToastMsg(result.error);
    } else {
      setToastMsg("Cliente cadastrado com sucesso!");
      onOpenChange(false);
      reset();
    }
    setTimeout(() => setToastMsg(null), 3000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Input placeholder="Nome do cliente" {...register("nome")}/>
            {errors.nome && <span className="text-red-500 text-xs">{errors.nome.message}</span>}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            Salvar
          </Button>
        </form>
        {toastMsg && (
          <div className="mt-2 text-sm text-center rounded bg-muted p-2 text-foreground border">
            {toastMsg}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
