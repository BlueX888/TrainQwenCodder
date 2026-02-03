const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let comboCount = 0;
let comboTimer = null;
let comboText = null;
let clickArea = null;
let timerText = null;
let remainingTime = 0;
let specialEffectActive = false;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 创建标题文本
  const titleText = this.add.text(400, 50, 'Orange Combo Counter', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 创建橙色可点击区域
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  graphics.fillRoundedRect(250, 200, 300, 200, 20);
  
  // 添加交互区域
  clickArea = this.add.zone(400, 300, 300, 200)
    .setInteractive({ useHandCursor: true });
  
  // 添加点击提示文本
  const hintText = this.add.text(400, 300, 'Click Here!', {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 创建Combo显示文本
  comboText = this.add.text(400, 450, 'Combo: 0', {
    fontSize: '36px',
    fontFamily: 'Arial',
    color: '#FF8C00',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 创建倒计时显示文本
  timerText = this.add.text(400, 500, '', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffff00'
  }).setOrigin(0.5);
  
  // 创建说明文本
  const instructionText = this.add.text(400, 550, 'Get 8 combos in 3 seconds for special effect!', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 点击事件处理
  clickArea.on('pointerdown', function() {
    // 增加combo
    comboCount++;
    updateComboDisplay();
    
    // 点击反馈动画
    scene.tweens.add({
      targets: graphics,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
    
    // 重置或创建计时器
    if (comboTimer) {
      comboTimer.remove();
    }
    
    remainingTime = 3000; // 3秒
    comboTimer = scene.time.addEvent({
      delay: 3000,
      callback: resetCombo,
      callbackScope: scene
    });
    
    // 检查是否达到8连击
    if (comboCount === 8 && !specialEffectActive) {
      triggerSpecialEffect(scene);
    }
  });
  
  // 更新Combo显示
  function updateComboDisplay() {
    comboText.setText('Combo: ' + comboCount);
    
    // Combo文本动画
    scene.tweens.add({
      targets: comboText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 150,
      yoyo: true,
      ease: 'Back.easeOut'
    });
    
    // 根据combo数改变颜色
    if (comboCount >= 8) {
      comboText.setColor('#ff0000'); // 红色
    } else if (comboCount >= 5) {
      comboText.setColor('#ffaa00'); // 深橙色
    } else {
      comboText.setColor('#FF8C00'); // 橙色
    }
  }
  
  // 重置Combo
  function resetCombo() {
    comboCount = 0;
    comboText.setText('Combo: 0');
    comboText.setColor('#FF8C00');
    timerText.setText('');
    remainingTime = 0;
    specialEffectActive = false;
    
    // 重置动画
    scene.tweens.add({
      targets: comboText,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });
  }
  
  // 触发特效
  function triggerSpecialEffect(scene) {
    specialEffectActive = true;
    
    // 1. 屏幕闪烁效果
    const flash = scene.add.graphics();
    flash.fillStyle(0xFFFFFF, 0.8);
    flash.fillRect(0, 0, 800, 600);
    flash.setDepth(100);
    
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy()
    });
    
    // 2. Combo文本爆炸效果
    scene.tweens.add({
      targets: comboText,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      yoyo: true,
      ease: 'Elastic.easeOut'
    });
    
    // 3. 创建粒子效果（使用Graphics模拟）
    for (let i = 0; i < 20; i++) {
      const particle = scene.add.graphics();
      particle.fillStyle(0xFF8C00, 1);
      particle.fillCircle(0, 0, 8);
      particle.setPosition(400, 450);
      
      const angle = (Math.PI * 2 / 20) * i;
      const distance = 150;
      
      scene.tweens.add({
        targets: particle,
        x: 400 + Math.cos(angle) * distance,
        y: 450 + Math.sin(angle) * distance,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
    
    // 4. 橙色区域脉冲效果
    scene.tweens.add({
      targets: graphics,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut'
    });
    
    // 5. 显示成功文本
    const successText = scene.add.text(400, 150, '★ COMBO MASTER! ★', {
      fontSize: '40px',
      fontFamily: 'Arial',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#ff0000',
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);
    
    scene.tweens.add({
      targets: successText,
      alpha: 1,
      y: 130,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    scene.tweens.add({
      targets: successText,
      alpha: 0,
      y: 100,
      duration: 500,
      delay: 1500,
      onComplete: () => successText.destroy()
    });
  }
}

function update(time, delta) {
  // 更新倒计时显示
  if (comboTimer && remainingTime > 0) {
    remainingTime -= delta;
    if (remainingTime < 0) remainingTime = 0;
    
    const seconds = (remainingTime / 1000).toFixed(2);
    timerText.setText('Time left: ' + seconds + 's');
    
    // 倒计时颜色变化
    if (remainingTime < 1000) {
      timerText.setColor('#ff0000'); // 红色警告
    } else {
      timerText.setColor('#ffff00');
    }
  }
}

// 创建游戏实例
new Phaser.Game(config);

// 导出状态用于验证
window.getComboCount = () => comboCount;