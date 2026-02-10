const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 游戏状态变量
let skillButton;
let cooldownOverlay;
let progressBar;
let progressBarBg;
let cooldownText;
let statusText;
let isCooldown = false;
let cooldownTimer = null;
let cooldownStartTime = 0;
let cooldownDuration = 3000; // 3秒冷却时间
let skillUseCount = 0; // 可验证的状态信号

function preload() {
  // 不需要加载外部资源
}

function create() {
  const scene = this;
  
  // 创建标题文字
  const title = this.add.text(400, 50, 'Skill Cooldown System', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 创建说明文字
  const instruction = this.add.text(400, 100, 'Click the skill button to use skill', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 创建技能按钮（圆形）
  const buttonX = 400;
  const buttonY = 300;
  const buttonRadius = 60;
  
  skillButton = this.add.graphics();
  skillButton.fillStyle(0x4CAF50, 1);
  skillButton.fillCircle(buttonX, buttonY, buttonRadius);
  skillButton.lineStyle(4, 0x2E7D32, 1);
  skillButton.strokeCircle(buttonX, buttonY, buttonRadius);
  
  // 技能图标（简单的闪电符号）
  const icon = this.add.graphics();
  icon.lineStyle(6, 0xFFEB3B, 1);
  icon.beginPath();
  icon.moveTo(buttonX - 10, buttonY - 20);
  icon.lineTo(buttonX + 5, buttonY);
  icon.lineTo(buttonX - 5, buttonY);
  icon.lineTo(buttonX + 10, buttonY + 20);
  icon.strokePath();
  
  // 创建冷却遮罩（初始隐藏）
  cooldownOverlay = this.add.graphics();
  cooldownOverlay.fillStyle(0x000000, 0.7);
  cooldownOverlay.fillCircle(buttonX, buttonY, buttonRadius);
  cooldownOverlay.setVisible(false);
  
  // 创建进度条背景
  progressBarBg = this.add.graphics();
  progressBarBg.fillStyle(0x333333, 1);
  progressBarBg.fillRect(buttonX - 50, buttonY + 80, 100, 15);
  progressBarBg.setVisible(false);
  
  // 创建进度条
  progressBar = this.add.graphics();
  progressBar.setVisible(false);
  
  // 冷却时间文字
  cooldownText = this.add.text(buttonX, buttonY, '', {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  cooldownText.setVisible(false);
  
  // 状态文字
  statusText = this.add.text(400, 450, 'Skill Ready! Click to use.', {
    fontSize: '20px',
    color: '#4CAF50'
  }).setOrigin(0.5);
  
  // 使用计数显示
  const countText = this.add.text(400, 500, '', {
    fontSize: '16px',
    color: '#888888'
  }).setOrigin(0.5);
  
  // 添加点击事件
  this.input.on('pointerdown', (pointer) => {
    const distance = Phaser.Math.Distance.Between(
      pointer.x, pointer.y, buttonX, buttonY
    );
    
    if (distance <= buttonRadius && !isCooldown) {
      // 释放技能
      useSkill(scene);
    }
  });
  
  // 技能释放函数
  function useSkill(scene) {
    skillUseCount++;
    isCooldown = true;
    cooldownStartTime = scene.time.now;
    
    // 显示冷却效果
    cooldownOverlay.setVisible(true);
    progressBarBg.setVisible(true);
    progressBar.setVisible(true);
    cooldownText.setVisible(true);
    
    // 更新状态文字
    statusText.setText('Skill Used! Cooling down...');
    statusText.setColor('#FF5722');
    countText.setText(`Total Uses: ${skillUseCount}`);
    
    // 创建技能释放特效（简单的扩散圆环）
    const effect = scene.add.graphics();
    effect.lineStyle(4, 0xFFEB3B, 1);
    
    scene.tweens.add({
      targets: { radius: buttonRadius },
      radius: buttonRadius + 40,
      duration: 500,
      ease: 'Power2',
      onUpdate: (tween) => {
        const value = tween.getValue();
        effect.clear();
        effect.lineStyle(4, 0xFFEB3B, 1 - tween.progress);
        effect.strokeCircle(buttonX, buttonY, value);
      },
      onComplete: () => {
        effect.destroy();
      }
    });
    
    // 设置冷却计时器
    cooldownTimer = scene.time.addEvent({
      delay: cooldownDuration,
      callback: () => {
        // 冷却结束
        isCooldown = false;
        cooldownOverlay.setVisible(false);
        progressBarBg.setVisible(false);
        progressBar.setVisible(false);
        cooldownText.setVisible(false);
        
        statusText.setText('Skill Ready! Click to use.');
        statusText.setColor('#4CAF50');
        
        cooldownTimer = null;
      }
    });
  }
  
  // 保存引用供update使用
  this.buttonX = buttonX;
  this.buttonY = buttonY;
  this.countText = countText;
}

function update(time, delta) {
  if (isCooldown && cooldownTimer) {
    // 计算冷却进度
    const elapsed = time - cooldownStartTime;
    const progress = Math.min(elapsed / cooldownDuration, 1);
    const remaining = Math.max(cooldownDuration - elapsed, 0);
    
    // 更新进度条
    progressBar.clear();
    progressBar.fillStyle(0x4CAF50, 1);
    const barWidth = 100 * (1 - progress);
    progressBar.fillRect(this.buttonX - 50, this.buttonY + 80, barWidth, 15);
    
    // 更新冷却时间文字
    const remainingSeconds = (remaining / 1000).toFixed(1);
    cooldownText.setText(remainingSeconds + 's');
  }
}

new Phaser.Game(config);