import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8 space-y-2">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground max-w-[750px]">{description}</p>
      )}
    </div>
  );
}