const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: { preload, create, update }
};

// 游戏状态（可验证）
let gameState = {
  combo: 0,
  maxCombo: 0,
  totalClicks: 0,
  specialTriggered: false
};

let comboText;
let clickArea;
let comboTimer;
let specialText;
let particles = [];
let timerBar;
let timerBarBg;
let remainingTime = 0;
let maxTime = 2500; // 2.5秒

function preload() {
  // 创建青色圆形纹理用于粒子
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('particle', 16, 16);
  graphics.destroy();
  
  // 创建点击区域纹理
  const clickGraphics = this.add.graphics();
  clickGraphics.fillStyle(0x00ffff, 0.3);
  clickGraphics.fillRoundedRect(0, 0, 300, 300, 20);
  clickGraphics.lineStyle(4, 0x00ffff, 1);
  clickGraphics.strokeRoundedRect(0, 0, 300, 300, 20);
  clickGraphics.generateTexture('clickArea', 300, 300);
  clickGraphics.destroy();
}

function create() {
  // 标题
  const title = this.add.text(400, 50, '青色连击挑战', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // 点击区域
  clickArea = this.add.image(400, 300, 'clickArea').setInteractive();
  
  // 点击提示文字
  this.add.text(400, 300, '点击这里！', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);

  // Combo 显示
  comboText = this.add.text(400, 150, 'COMBO: 0', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#00ffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // 最高连击显示
  this.add.text(400, 500, 'Max Combo: 0', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#888888'
  }).setOrigin(0.5).setName('maxComboText');

  // 统计信息
  this.add.text(400, 530, 'Total Clicks: 0', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#666666'
  }).setOrigin(0.5).setName('statsText');

  // 计时器背景条
  timerBarBg = this.add.graphics();
  timerBarBg.fillStyle(0x333333, 1);
  timerBarBg.fillRect(250, 470, 300, 15);

  // 计时器进度条
  timerBar = this.add.graphics();

  // 特效文字（初始隐藏）
  specialText = this.add.text(400, 200, '', {
    fontSize: '64px',
    fontFamily: 'Arial',
    color: '#ffff00',
    fontStyle: 'bold',
    stroke: '#ff0000',
    strokeThickness: 4
  }).setOrigin(0.5).setAlpha(0);

  // 点击事件
  clickArea.on('pointerdown', () => {
    handleClick.call(this);
  });

  // 点击反馈动画
  clickArea.on('pointerdown', () => {
    this.tweens.add({
      targets: clickArea,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 100,
      yoyo: true
    });
  });

  // 初始化计时器（不启动）
  comboTimer = null;
  remainingTime = maxTime;
}

function handleClick() {
  // 增加combo
  gameState.combo++;
  gameState.totalClicks++;
  
  // 更新最高连击
  if (gameState.combo > gameState.maxCombo) {
    gameState.maxCombo = gameState.combo;
  }

  // 更新显示
  updateDisplay.call(this);

  // 重置计时器
  if (comboTimer) {
    comboTimer.remove();
  }
  
  remainingTime = maxTime;
  
  comboTimer = this.time.addEvent({
    delay: maxTime,
    callback: () => {
      resetCombo.call(this);
    }
  });

  // 检查是否达到15连击
  if (gameState.combo === 15 && !gameState.specialTriggered) {
    triggerSpecialEffect.call(this);
  }

  // 创建点击位置的小粒子
  createClickParticle.call(this, this.input.activePointer.x, this.input.activePointer.y);
}

function resetCombo() {
  gameState.combo = 0;
  gameState.specialTriggered = false;
  comboTimer = null;
  remainingTime = 0;
  updateDisplay.call(this);
}

function updateDisplay() {
  // 更新combo文字
  comboText.setText(`COMBO: ${gameState.combo}`);
  
  // Combo数字颜色变化
  if (gameState.combo >= 15) {
    comboText.setColor('#ffff00');
  } else if (gameState.combo >= 10) {
    comboText.setColor('#ff00ff');
  } else if (gameState.combo >= 5) {
    comboText.setColor('#00ff00');
  } else {
    comboText.setColor('#00ffff');
  }

  // 更新最高连击
  const maxComboText = this.children.getByName('maxComboText');
  if (maxComboText) {
    maxComboText.setText(`Max Combo: ${gameState.maxCombo}`);
  }

  // 更新统计
  const statsText = this.children.getByName('statsText');
  if (statsText) {
    statsText.setText(`Total Clicks: ${gameState.totalClicks}`);
  }

  // Combo文字缩放动画
  this.tweens.add({
    targets: comboText,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 100,
    yoyo: true
  });
}

function triggerSpecialEffect() {
  gameState.specialTriggered = true;

  // 显示特效文字
  specialText.setText('★ 15 COMBO! ★');
  specialText.setAlpha(1);

  // 文字动画
  this.tweens.add({
    targets: specialText,
    scaleX: 1.5,
    scaleY: 1.5,
    alpha: 0,
    duration: 2000,
    ease: 'Power2'
  });

  // 创建爆炸粒子效果
  for (let i = 0; i < 50; i++) {
    const angle = (Math.PI * 2 * i) / 50;
    const speed = 200 + Math.random() * 100;
    createParticle.call(this, 400, 300, angle, speed);
  }

  // 屏幕闪烁效果
  const flash = this.add.graphics();
  flash.fillStyle(0xffff00, 0.3);
  flash.fillRect(0, 0, 800, 600);
  this.tweens.add({
    targets: flash,
    alpha: 0,
    duration: 500,
    onComplete: () => flash.destroy()
  });

  // 相机震动
  this.cameras.main.shake(300, 0.01);
}

function createParticle(x, y, angle, speed) {
  const particle = this.add.image(x, y, 'particle');
  particle.setTint(0x00ffff);
  
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  
  particles.push({
    sprite: particle,
    vx: vx,
    vy: vy,
    life: 1.0
  });
}

function createClickParticle(x, y) {
  for (let i = 0; i < 5; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 50;
    createParticle.call(this, x, y, angle, speed);
  }
}

function update(time, delta) {
  // 更新计时器进度条
  if (comboTimer && gameState.combo > 0) {
    remainingTime -= delta;
    if (remainingTime < 0) remainingTime = 0;
    
    const progress = remainingTime / maxTime;
    
    timerBar.clear();
    
    // 根据剩余时间改变颜色
    let color = 0x00ff00; // 绿色
    if (progress < 0.3) {
      color = 0xff0000; // 红色
    } else if (progress < 0.6) {
      color = 0xffff00; // 黄色
    }
    
    timerBar.fillStyle(color, 1);
    timerBar.fillRect(250, 470, 300 * progress, 15);
  } else {
    timerBar.clear();
  }

  // 更新粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    
    p.sprite.x += p.vx * delta / 1000;
    p.sprite.y += p.vy * delta / 1000;
    p.life -= delta / 1000;
    
    p.sprite.setAlpha(p.life);
    p.sprite.setScale(p.life);
    
    if (p.life <= 0) {
      p.sprite.destroy();
      particles.splice(i, 1);
    }
  }
}

new Phaser.Game(config);

// 导出游戏状态供验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { gameState };
}