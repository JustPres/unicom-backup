"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle } from "lucide-react"

interface RejectQuoteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (reason: string) => void
    quoteName?: string
}

const REJECTION_REASONS = [
    "Incomplete customer information",
    "Suspicious company details",
    "Invalid or incomplete name provided",
    "Missing required contact information",
    "Unusually large order quantity (verification needed)",
    "Product availability issues",
    "Other (specify below)",
]

export function RejectQuoteDialog({ open, onOpenChange, onConfirm, quoteName }: RejectQuoteDialogProps) {
    const [selectedReason, setSelectedReason] = useState<string>("")
    const [customReason, setCustomReason] = useState<string>("")
    const [error, setError] = useState<string>("")

    const handleConfirm = () => {
        // Validation
        if (!selectedReason) {
            setError("Please select a reason for rejection")
            return
        }

        if (selectedReason === "Other (specify below)" && !customReason.trim()) {
            setError("Please provide a specific reason")
            return
        }

        // Build final reason
        const finalReason = selectedReason === "Other (specify below)"
            ? customReason.trim()
            : selectedReason

        onConfirm(finalReason)

        // Reset form
        setSelectedReason("")
        setCustomReason("")
        setError("")
    }

    const handleCancel = () => {
        setSelectedReason("")
        setCustomReason("")
        setError("")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        Reject Quote Request
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {quoteName && (
                        <p className="text-sm text-muted-foreground">
                            Please select a reason for rejecting the quote from <strong>{quoteName}</strong>:
                        </p>
                    )}

                    <div className="space-y-3">
                        <Label>Rejection Reason *</Label>
                        <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                            {REJECTION_REASONS.map((reason) => (
                                <div key={reason} className="flex items-center space-x-2">
                                    <RadioGroupItem value={reason} id={reason} />
                                    <Label htmlFor={reason} className="font-normal cursor-pointer">
                                        {reason}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {selectedReason === "Other (specify below)" && (
                        <div className="space-y-2">
                            <Label htmlFor="customReason">Specific Reason *</Label>
                            <Textarea
                                id="customReason"
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Please provide a specific reason for rejection..."
                                rows={3}
                                className="resize-none"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                        <p className="text-sm text-amber-800">
                            <strong>Note:</strong> The customer will be able to see this rejection reason. Please ensure it is professional and clear.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm}>
                        Reject Quote
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
