const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 游戏状态变量
let skillCooldown = false;
let cooldownProgress = 0;
let skillUseCount = 0;

// UI元素
let cooldownBar;
let cooldownBarBg;
let statusText;
let skillEffectGroup;

// 常量
const COOLDOWN_DURATION = 500; // 0.5秒 = 500毫秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 初始化状态
  skillCooldown = false;
  cooldownProgress = 0;
  skillUseCount = 0;

  // 创建技能效果容器
  skillEffectGroup = this.add.group();

  // 创建标题文本
  const titleText = this.add.text(400, 50, '粉色技能冷却系统', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);

  // 创建说明文本
  const instructionText = this.add.text(400, 100, '按下空格键释放技能', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  });
  instructionText.setOrigin(0.5);

  // 创建状态显示文本
  statusText = this.add.text(400, 150, '技能就绪 | 使用次数: 0', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#00ff00'
  });
  statusText.setOrigin(0.5);

  // 创建冷却条背景
  cooldownBarBg = this.add.graphics();
  cooldownBarBg.fillStyle(0x444444, 1);
  cooldownBarBg.fillRoundedRect(250, 200, 300, 40, 10);

  // 创建冷却条
  cooldownBar = this.add.graphics();

  // 创建冷却条边框
  const cooldownBorder = this.add.graphics();
  cooldownBorder.lineStyle(3, 0xffffff, 1);
  cooldownBorder.strokeRoundedRect(250, 200, 300, 40, 10);

  // 创建冷却文本
  const cooldownLabel = this.add.text(400, 260, '冷却进度', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });
  cooldownLabel.setOrigin(0.5);

  // 监听空格键
  const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  spaceKey.on('down', () => {
    if (!skillCooldown) {
      activateSkill.call(this);
    }
  });

  // 创建技能展示区域标签
  const skillAreaLabel = this.add.text(400, 320, '技能效果区域', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#888888'
  });
  skillAreaLabel.setOrigin(0.5);
}

function activateSkill() {
  // 设置冷却状态
  skillCooldown = true;
  cooldownProgress = 0;
  skillUseCount++;

  // 更新状态文本
  updateStatusText();

  // 创建粉色技能效果
  createSkillEffect.call(this);

  // 启动冷却计时器
  const cooldownTimer = this.time.addEvent({
    delay: COOLDOWN_DURATION,
    callback: () => {
      skillCooldown = false;
      cooldownProgress = 1;
      updateStatusText();
    },
    callbackScope: this
  });
}

function createSkillEffect() {
  // 创建粉色爆发效果
  const centerX = 400;
  const centerY = 450;

  // 创建多个粉色圆形粒子
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 / 12) * i;
    const distance = 0;
    const maxDistance = 120;

    const particle = this.add.graphics();
    particle.fillStyle(0xff69b4, 1); // 粉色
    particle.fillCircle(0, 0, 15);
    particle.x = centerX + Math.cos(angle) * distance;
    particle.y = centerY + Math.sin(angle) * distance;

    skillEffectGroup.add(particle);

    // 粒子扩散动画
    this.tweens.add({
      targets: particle,
      x: centerX + Math.cos(angle) * maxDistance,
      y: centerY + Math.sin(angle) * maxDistance,
      alpha: 0,
      scale: 0.3,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        particle.destroy();
      }
    });
  }

  // 创建中心粉色光环
  const coreRing = this.add.graphics();
  coreRing.lineStyle(8, 0xff1493, 1); // 深粉色
  coreRing.strokeCircle(centerX, centerY, 20);
  skillEffectGroup.add(coreRing);

  this.tweens.add({
    targets: coreRing,
    alpha: 0,
    duration: 500,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      coreRing.destroy();
    }
  });

  // 创建扩散光环
  const expandRing = this.add.graphics();
  expandRing.lineStyle(5, 0xffc0cb, 1); // 浅粉色
  expandRing.strokeCircle(centerX, centerY, 20);
  skillEffectGroup.add(expandRing);

  this.tweens.add({
    targets: expandRing,
    scaleX: 6,
    scaleY: 6,
    alpha: 0,
    duration: 500,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      expandRing.destroy();
    }
  });
}

function updateStatusText() {
  if (skillCooldown) {
    statusText.setText(`冷却中... | 使用次数: ${skillUseCount}`);
    statusText.setColor('#ff0000');
  } else {
    statusText.setText(`技能就绪 | 使用次数: ${skillUseCount}`);
    statusText.setColor('#00ff00');
  }
}

function update(time, delta) {
  // 更新冷却进度
  if (skillCooldown) {
    cooldownProgress += delta / COOLDOWN_DURATION;
    cooldownProgress = Math.min(cooldownProgress, 1);
  }

  // 绘制冷却进度条
  cooldownBar.clear();
  
  if (cooldownProgress > 0 && cooldownProgress < 1) {
    // 冷却中 - 显示粉色进度
    const barWidth = 300 * cooldownProgress;
    cooldownBar.fillStyle(0xff69b4, 1); // 粉色
    cooldownBar.fillRoundedRect(250, 200, barWidth, 40, 10);
  } else if (cooldownProgress >= 1) {
    // 冷却完成 - 显示绿色
    cooldownBar.fillStyle(0x00ff00, 1);
    cooldownBar.fillRoundedRect(250, 200, 300, 40, 10);
    
    // 冷却完成后逐渐清空进度条
    this.tweens.add({
      targets: { value: 1 },
      value: 0,
      duration: 300,
      onUpdate: (tween) => {
        const val = tween.getValue();
        cooldownBar.clear();
        cooldownBar.fillStyle(0x00ff00, val);
        cooldownBar.fillRoundedRect(250, 200, 300, 40, 10);
      },
      onComplete: () => {
        cooldownProgress = 0;
      }
    });
  }
}

new Phaser.Game(config);