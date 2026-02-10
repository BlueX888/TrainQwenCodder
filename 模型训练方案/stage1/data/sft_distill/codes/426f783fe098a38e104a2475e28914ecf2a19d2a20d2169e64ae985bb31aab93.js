const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 游戏状态变量
let skillCooldown = 0; // 当前冷却时间（秒）
let skillMaxCooldown = 1.5; // 最大冷却时间（秒）
let isSkillReady = true; // 技能是否就绪
let skillUseCount = 0; // 技能使用次数（可验证状态）

// 游戏对象引用
let skillIcon;
let cooldownMask;
let cooldownBar;
let cooldownText;
let statusText;
let spaceKey;
let cooldownTimer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const scene = this;
  
  // 创建标题
  const title = this.add.text(400, 50, '技能冷却系统', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建说明文字
  const instruction = this.add.text(400, 100, '按 [空格键] 释放技能', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 创建技能图标背景（蓝色圆形）
  const iconBg = this.add.graphics();
  iconBg.fillStyle(0x1a1a1a, 1);
  iconBg.fillCircle(400, 300, 82);
  
  // 创建技能图标（蓝色圆形）
  skillIcon = this.add.graphics();
  skillIcon.fillStyle(0x4a90e2, 1);
  skillIcon.fillCircle(400, 300, 80);
  
  // 创建技能图标内部装饰
  const iconDecor = this.add.graphics();
  iconDecor.lineStyle(4, 0xffffff, 0.8);
  iconDecor.strokeCircle(400, 300, 50);
  iconDecor.lineStyle(3, 0xffffff, 0.6);
  iconDecor.beginPath();
  iconDecor.moveTo(400, 250);
  iconDecor.lineTo(400, 280);
  iconDecor.moveTo(370, 300);
  iconDecor.lineTo(430, 300);
  iconDecor.strokePath();
  
  // 创建冷却遮罩（半透明黑色圆形）
  cooldownMask = this.add.graphics();
  cooldownMask.visible = false;
  
  // 创建冷却进度条背景
  const barBg = this.add.graphics();
  barBg.fillStyle(0x333333, 1);
  barBg.fillRoundedRect(250, 420, 300, 30, 15);
  
  // 创建冷却进度条
  cooldownBar = this.add.graphics();
  
  // 创建冷却倒计时文本
  cooldownText = this.add.text(400, 435, '', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 创建状态文本
  statusText = this.add.text(400, 500, '技能就绪！', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#00ff00'
  }).setOrigin(0.5);
  
  // 创建使用次数显示
  const useCountText = this.add.text(400, 550, '', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#888888'
  }).setOrigin(0.5);
  
  // 更新使用次数显示的函数
  this.updateUseCount = function() {
    useCountText.setText(`技能使用次数: ${skillUseCount}`);
  };
  this.updateUseCount();
  
  // 监听空格键
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 空格键按下事件
  spaceKey.on('down', () => {
    if (isSkillReady) {
      useSkill(scene);
    }
  });
}

function update(time, delta) {
  // 更新冷却时间
  if (!isSkillReady) {
    skillCooldown -= delta / 1000; // 转换为秒
    
    if (skillCooldown <= 0) {
      // 冷却结束
      skillCooldown = 0;
      isSkillReady = true;
      cooldownMask.visible = false;
      statusText.setText('技能就绪！');
      statusText.setColor('#00ff00');
      cooldownText.setText('');
    } else {
      // 更新冷却显示
      updateCooldownDisplay();
    }
  }
}

// 使用技能
function useSkill(scene) {
  // 标记技能进入冷却
  isSkillReady = false;
  skillCooldown = skillMaxCooldown;
  skillUseCount++;
  
  // 更新状态文本
  statusText.setText('技能冷却中...');
  statusText.setColor('#ff6666');
  
  // 更新使用次数
  scene.updateUseCount();
  
  // 显示技能释放效果
  showSkillEffect(scene);
  
  // 显示冷却遮罩
  cooldownMask.visible = true;
}

// 显示技能释放效果
function showSkillEffect(scene) {
  // 创建技能释放的视觉效果（蓝色波纹）
  const effect = scene.add.graphics();
  effect.lineStyle(5, 0x4a90e2, 1);
  effect.strokeCircle(400, 300, 80);
  
  // 波纹扩散动画
  scene.tweens.add({
    targets: effect,
    alpha: 0,
    duration: 500,
    ease: 'Power2',
    onUpdate: (tween) => {
      const progress = tween.progress;
      const radius = 80 + progress * 100;
      effect.clear();
      effect.lineStyle(5 * (1 - progress), 0x4a90e2, 1 - progress);
      effect.strokeCircle(400, 300, radius);
    },
    onComplete: () => {
      effect.destroy();
    }
  });
  
  // 技能图标闪烁效果
  scene.tweens.add({
    targets: skillIcon,
    alpha: 0.5,
    duration: 100,
    yoyo: true,
    repeat: 2
  });
}

// 更新冷却显示
function updateCooldownDisplay() {
  const progress = 1 - (skillCooldown / skillMaxCooldown);
  
  // 更新冷却遮罩（扇形遮罩）
  cooldownMask.clear();
  cooldownMask.fillStyle(0x000000, 0.6);
  cooldownMask.beginPath();
  cooldownMask.moveTo(400, 300);
  cooldownMask.arc(
    400, 300, 80,
    Phaser.Math.DegToRad(-90),
    Phaser.Math.DegToRad(-90 + 360 * (1 - progress)),
    false
  );
  cooldownMask.closePath();
  cooldownMask.fillPath();
  
  // 更新进度条
  cooldownBar.clear();
  const barWidth = 300 * progress;
  if (barWidth > 0) {
    cooldownBar.fillStyle(0x4a90e2, 1);
    cooldownBar.fillRoundedRect(250, 420, barWidth, 30, 15);
  }
  
  // 更新倒计时文本
  cooldownText.setText(`${skillCooldown.toFixed(1)}s`);
}

new Phaser.Game(config);