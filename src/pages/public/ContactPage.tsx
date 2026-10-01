import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Field, MediaFrame, SignalButton, TextArea, TextInput } from "@/components";
import { media } from "@/config/media";
import { PublicLayout } from "@/layouts/PublicLayout";

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2 || !email.includes("@") || message.trim().length < 8) {
      toast.error("Add your name, a work email and a short message.");
      return;
    }
    toast.success("Message recorded. In production this reaches Amina, not a ticket queue.");
    setName("");
    setEmail("");
    setOrganisation("");
    setMessage("");
  }

  return (
    <PublicLayout>
      <article className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label-paren">(a named person)</p>
            <h1 className="heading-1 mt-2">Write to Amina.</h1>
            <p className="mt-6 max-w-[42ch] text-muted-foreground">
              Amina Patel is the platform contact. She speaks English and isiZulu. DataForge is
              self-hosted for one organisation. There is no public signup for other companies in the
              first release.
            </p>
            <MediaFrame {...media.contact} className="mt-8" />
            <dl className="mt-8 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-border py-3">
                <dt className="text-muted-foreground">Name</dt>
                <dd>Amina Patel</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border py-3">
                <dt className="text-muted-foreground">Role</dt>
                <dd>Platform contact</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border py-3">
                <dt className="text-muted-foreground">Languages</dt>
                <dd>English, isiZulu</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border py-3">
                <dt className="text-muted-foreground">Channel</dt>
                <dd>This form, in the prototype</dd>
              </div>
            </dl>
          </div>

          <form className="space-y-4 lg:col-span-6 lg:col-start-7" onSubmit={onSubmit}>
            <Field label="Your name">
              <TextInput value={name} onChange={(event) => setName(event.target.value)} />
            </Field>
            <Field label="Work email">
              <TextInput
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field label="Organisation">
              <TextInput
                value={organisation}
                onChange={(event) => setOrganisation(event.target.value)}
              />
            </Field>
            <Field label="Message">
              <TextArea
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </Field>
            <SignalButton type="submit">Send the message</SignalButton>
          </form>
        </div>
      </article>
    </PublicLayout>
  );
}
