const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 可验证的状态变量
let comboCount = 0;
let maxComboReached = false;
let totalClicks = 0;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const scene = this;
  
  // 重置状态
  comboCount = 0;
  maxComboReached = false;
  totalClicks = 0;
  
  // 创建点击区域背景
  const clickZone = scene.add.graphics();
  clickZone.fillStyle(0x00CED1, 0.3); // 青色半透明
  clickZone.fillRoundedRect(250, 200, 300, 200, 20);
  clickZone.lineStyle(4, 0x00CED1, 1);
  clickZone.strokeRoundedRect(250, 200, 300, 200, 20);
  
  // 添加提示文字
  const hintText = scene.add.text(400, 250, 'CLICK HERE!', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00CED1',
    fontStyle: 'bold'
  });
  hintText.setOrigin(0.5);
  
  // 创建combo显示文本
  const comboText = scene.add.text(400, 320, 'Combo: 0', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#FFFFFF',
    fontStyle: 'bold'
  });
  comboText.setOrigin(0.5);
  
  // 创建计时器提示
  const timerText = scene.add.text(400, 380, '', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#FFD700'
  });
  timerText.setOrigin(0.5);
  
  // 创建特效提示文本（初始隐藏）
  const specialText = scene.add.text(400, 100, '🎉 15 COMBO! 🎉', {
    fontSize: '56px',
    fontFamily: 'Arial',
    color: '#FF1493',
    fontStyle: 'bold',
    stroke: '#FFFFFF',
    strokeThickness: 4
  });
  specialText.setOrigin(0.5);
  specialText.setVisible(false);
  
  // 创建粒子纹理
  const particleGraphics = scene.add.graphics();
  particleGraphics.fillStyle(0x00CED1, 1);
  particleGraphics.fillCircle(8, 8, 8);
  particleGraphics.generateTexture('particle', 16, 16);
  particleGraphics.destroy();
  
  // 创建粒子发射器（初始停止）
  const particles = scene.add.particles('particle');
  const emitter = particles.createEmitter({
    x: 400,
    y: 300,
    speed: { min: 200, max: 400 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 1000,
    frequency: 50,
    quantity: 3,
    blendMode: 'ADD'
  });
  emitter.stop();
  
  // 计时器变量
  let comboTimer = null;
  let timerStartTime = 0;
  const COMBO_TIMEOUT = 2500; // 2.5秒
  
  // 更新计时器显示
  function updateTimerDisplay() {
    if (comboTimer && comboCount > 0) {
      const elapsed = scene.time.now - timerStartTime;
      const remaining = Math.max(0, COMBO_TIMEOUT - elapsed);
      const seconds = (remaining / 1000).toFixed(1);
      timerText.setText(`Time left: ${seconds}s`);
      
      // 根据剩余时间改变颜色
      if (remaining < 500) {
        timerText.setColor('#FF0000');
      } else if (remaining < 1000) {
        timerText.setColor('#FFA500');
      } else {
        timerText.setColor('#FFD700');
      }
    } else {
      timerText.setText('');
    }
  }
  
  // 重置combo
  function resetCombo() {
    comboCount = 0;
    comboText.setText('Combo: 0');
    comboText.setColor('#FFFFFF');
    timerText.setText('');
    if (comboTimer) {
      comboTimer.remove();
      comboTimer = null;
    }
  }
  
  // 触发15连特效
  function triggerSpecialEffect() {
    if (maxComboReached) return;
    
    maxComboReached = true;
    
    // 显示特效文字
    specialText.setVisible(true);
    specialText.setScale(0);
    scene.tweens.add({
      targets: specialText,
      scale: 1.2,
      duration: 300,
      ease: 'Back.easeOut',
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        specialText.setVisible(false);
      }
    });
    
    // 启动粒子效果
    emitter.start();
    scene.time.delayedCall(2000, () => {
      emitter.stop();
    });
    
    // 屏幕闪烁效果
    const flash = scene.add.graphics();
    flash.fillStyle(0x00CED1, 0.5);
    flash.fillRect(0, 0, 800, 600);
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        flash.destroy();
      }
    });
    
    // 震动效果
    scene.cameras.main.shake(500, 0.01);
  }
  
  // 点击事件处理
  scene.input.on('pointerdown', (pointer) => {
    // 检查是否点击在区域内
    if (pointer.x >= 250 && pointer.x <= 550 &&
        pointer.y >= 200 && pointer.y <= 400) {
      
      totalClicks++;
      comboCount++;
      
      // 更新combo显示
      comboText.setText(`Combo: ${comboCount}`);
      
      // 根据combo数改变颜色
      if (comboCount >= 15) {
        comboText.setColor('#FF1493'); // 粉红色
        triggerSpecialEffect();
      } else if (comboCount >= 10) {
        comboText.setColor('#FF4500'); // 橙红色
      } else if (comboCount >= 5) {
        comboText.setColor('#FFD700'); // 金色
      } else {
        comboText.setColor('#00CED1'); // 青色
      }
      
      // 点击反馈动画
      scene.tweens.add({
        targets: comboText,
        scale: 1.2,
        duration: 100,
        yoyo: true,
        ease: 'Quad.easeOut'
      });
      
      // 创建点击涟漪效果
      const ripple = scene.add.graphics();
      ripple.lineStyle(3, 0x00CED1, 1);
      ripple.strokeCircle(pointer.x, pointer.y, 10);
      scene.tweens.add({
        targets: ripple,
        alpha: 0,
        duration: 500,
        onUpdate: (tween) => {
          const progress = tween.progress;
          ripple.clear();
          ripple.lineStyle(3 * (1 - progress), 0x00CED1, 1 - progress);
          ripple.strokeCircle(pointer.x, pointer.y, 10 + progress * 50);
        },
        onComplete: () => {
          ripple.destroy();
        }
      });
      
      // 重置或创建计时器
      if (comboTimer) {
        comboTimer.remove();
      }
      
      timerStartTime = scene.time.now;
      comboTimer = scene.time.delayedCall(COMBO_TIMEOUT, () => {
        resetCombo();
      });
    }
  });
  
  // 存储到scene以便update使用
  scene.updateTimerDisplay = updateTimerDisplay;
  
  // 添加统计信息显示
  const statsText = scene.add.text(10, 10, '', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#AAAAAA'
  });
  
  scene.statsText = statsText;
}

function update(time, delta) {
  // 更新计时器显示
  if (this.updateTimerDisplay) {
    this.updateTimerDisplay();
  }
  
  // 更新统计信息
  if (this.statsText) {
    this.statsText.setText(
      `Total Clicks: ${totalClicks}\n` +
      `Current Combo: ${comboCount}\n` +
      `15-Combo Reached: ${maxComboReached ? 'YES' : 'NO'}`
    );
  }
}

// 启动游戏
new Phaser.Game(config);