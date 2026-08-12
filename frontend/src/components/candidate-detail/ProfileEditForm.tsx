import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Eye } from "lucide-react";

import { TagInput } from "../TagInput";
import { Button } from "../ui/button";
import { Input, Textarea } from "../ui/input";
import { basicFieldLabels, profileSectionLabels } from "./profile-utils";
import type { ProfileForm } from "./profile-utils";

interface ProfileEditFormProps {
  profileForm: ProfileForm;
  setProfileForm: Dispatch<SetStateAction<ProfileForm>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSavePending: boolean;
  onCancelEdit: () => void;
}

export function ProfileEditForm({
  profileForm,
  setProfileForm,
  onSubmit,
  isSavePending,
  onCancelEdit,
}: ProfileEditFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-border bg-card p-5 animate-fade-in-up animation-delay-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">简历编辑修正</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancelEdit}
          >
            <Eye className="h-3.5 w-3.5" /> 返回预览
          </Button>
        </div>
        <Button type="submit" size="sm">
          {isSavePending ? "保存中" : "保存修正"}
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {(["name", "phone", "email", "city"] as const).map((key) => (
          <label key={key} className="text-sm">
            <span className="text-muted-foreground">{basicFieldLabels[key]}</span>
            <Input value={profileForm[key]} onChange={(event) => setProfileForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-1" />
          </label>
        ))}
      </div>
      <label className="block text-sm">
        <span className="text-muted-foreground">技能标签</span>
        <TagInput
          value={profileForm.skills}
          onChange={(skills) => setProfileForm((current) => ({ ...current, skills }))}
          className="mt-1"
          placeholder="添加技能"
          inputLabel="技能标签"
        />
      </label>
      {(["education", "work_experience", "projects"] as const).map((key) => (
        <label key={key} className="block text-sm">
          <span className="text-muted-foreground">{profileSectionLabels[key]}</span>
          <Textarea value={profileForm[key]} onChange={(event) => setProfileForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 font-mono text-xs" />
        </label>
      ))}
    </form>
  );
}
