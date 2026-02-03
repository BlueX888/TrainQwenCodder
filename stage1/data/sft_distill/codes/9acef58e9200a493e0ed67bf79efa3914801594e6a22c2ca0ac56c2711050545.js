const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 游戏状态变量（可验证）
let skillUsageCount = 0;  // 技能使用次数
let isOnCooldown = false;  // 是否在冷却中
let cooldownRemaining = 0; // 剩余冷却时间

const COOLDOWN_DURATION = 4000; // 冷却时间 4 秒

let spaceKey;
let cooldownTimer;
let statusText;
let cooldownBar;
let cooldownBarBg;
let skillEffectGraphics;
let instructionText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建说明文字
  instructionText = this.add.text(400, 50, '按空格键释放粉色技能', {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // 创建状态显示文字
  statusText = this.add.text(400, 100, '技能就绪！', {
    fontSize: '20px',
    color: '#00ff00',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // 创建使用次数显示
  this.usageCountText = this.add.text(400, 130, `使用次数: ${skillUsageCount}`, {
    fontSize: '18px',
    color: '#ffff00'
  }).setOrigin(0.5);

  // 创建冷却条背景
  cooldownBarBg = this.add.graphics();
  cooldownBarBg.fillStyle(0x333333, 1);
  cooldownBarBg.fillRect(250, 500, 300, 30);
  cooldownBarBg.lineStyle(2, 0x666666, 1);
  cooldownBarBg.strokeRect(250, 500, 300, 30);

  // 创建冷却进度条
  cooldownBar = this.add.graphics();

  // 创建技能效果图形对象
  skillEffectGraphics = this.add.graphics();

  // 创建冷却时间文字
  this.cooldownText = this.add.text(400, 515, '', {
    fontSize: '16px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // 监听空格键
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  spaceKey.on('down', () => {
    if (!isOnCooldown) {
      activateSkill.call(this);
    } else {
      // 技能冷却中，显示提示
      statusText.setText('技能冷却中...');
      statusText.setColor('#ff0000');
      this.time.delayedCall(500, () => {
        if (isOnCooldown) {
          statusText.setColor('#ff9900');
        }
      });
    }
  });
}

function activateSkill() {
  // 增加使用次数
  skillUsageCount++;
  this.usageCountText.setText(`使用次数: ${skillUsageCount}`);

  // 设置冷却状态
  isOnCooldown = true;
  cooldownRemaining = COOLDOWN_DURATION;

  // 更新状态文字
  statusText.setText('技能释放！');
  statusText.setColor('#ff00ff');

  // 创建粉色技能视觉效果
  createSkillEffect.call(this);

  // 启动冷却计时器
  if (cooldownTimer) {
    cooldownTimer.destroy();
  }

  cooldownTimer = this.time.addEvent({
    delay: COOLDOWN_DURATION,
    callback: () => {
      // 冷却结束
      isOnCooldown = false;
      cooldownRemaining = 0;
      statusText.setText('技能就绪！');
      statusText.setColor('#00ff00');
      
      // 清空冷却条
      cooldownBar.clear();
      this.cooldownText.setText('');
    },
    callbackScope: this
  });
}

function createSkillEffect() {
  // 清除之前的效果
  skillEffectGraphics.clear();

  // 绘制粉色扩散圆形效果
  const centerX = 400;
  const centerY = 300;
  const maxRadius = 150;

  // 创建多层粉色圆圈扩散动画
  for (let i = 0; i < 3; i++) {
    this.tweens.add({
      targets: { radius: 0, alpha: 1 },
      radius: maxRadius,
      alpha: 0,
      duration: 1000,
      delay: i * 200,
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => {
        const value = tween.getValue();
        skillEffectGraphics.clear();
        
        // 绘制当前所有活跃的圆圈
        for (let j = 0; j <= i; j++) {
          const progress = tween.progress;
          const delayFactor = j * 0.2;
          const adjustedProgress = Math.max(0, (progress - delayFactor) / (1 - delayFactor));
          
          if (adjustedProgress > 0) {
            const r = maxRadius * adjustedProgress;
            const a = (1 - adjustedProgress) * 0.8;
            
            skillEffectGraphics.lineStyle(4, 0xff00ff, a);
            skillEffectGraphics.strokeCircle(centerX, centerY, r);
            
            skillEffectGraphics.fillStyle(0xff00ff, a * 0.3);
            skillEffectGraphics.fillCircle(centerX, centerY, r);
          }
        }
      }
    });
  }

  // 中心粉色闪光
  skillEffectGraphics.fillStyle(0xff00ff, 0.8);
  skillEffectGraphics.fillCircle(centerX, centerY, 30);

  this.tweens.add({
    targets: skillEffectGraphics,
    alpha: 0,
    duration: 1000,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      skillEffectGraphics.clear();
      skillEffectGraphics.alpha = 1;
    }
  });
}

function update(time, delta) {
  if (isOnCooldown && cooldownTimer) {
    // 计算剩余冷却时间
    cooldownRemaining = Math.max(0, COOLDOWN_DURATION - cooldownTimer.getElapsed());
    
    // 计算冷却进度（0-1）
    const progress = 1 - (cooldownRemaining / COOLDOWN_DURATION);
    
    // 更新冷却进度条
    cooldownBar.clear();
    cooldownBar.fillStyle(0xff00ff, 0.8);
    cooldownBar.fillRect(250, 500, 300 * progress, 30);
    
    // 添加进度条边框高光
    cooldownBar.lineStyle(2, 0xff88ff, 1);
    cooldownBar.strokeRect(250, 500, 300 * progress, 30);
    
    // 更新冷却时间文字
    const remainingSeconds = (cooldownRemaining / 1000).toFixed(1);
    this.cooldownText.setText(`冷却中: ${remainingSeconds}s`);
    
    // 更新状态文字颜色（渐变效果）
    statusText.setColor('#ff9900');
  }
}

new Phaser.Game(config);