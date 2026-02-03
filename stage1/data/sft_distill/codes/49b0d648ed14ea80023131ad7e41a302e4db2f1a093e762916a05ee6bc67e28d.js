const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let gameState = {
  combo: 0,
  totalClicks: 0,
  comboTriggered: 0
};

let comboText;
let statusText;
let comboTimer;
let clickArea;
let effectGraphics;
let isEffectPlaying = false;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const scene = this;
  
  // 创建黄色点击区域背景
  clickArea = this.add.graphics();
  clickArea.fillStyle(0xffdd00, 1);
  clickArea.fillRoundedRect(200, 150, 400, 300, 20);
  
  // 创建边框
  clickArea.lineStyle(4, 0xffa500, 1);
  clickArea.strokeRoundedRect(200, 150, 400, 300, 20);
  
  // 创建提示文字
  const hintText = this.add.text(400, 200, 'CLICK HERE!', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#000000',
    fontStyle: 'bold'
  });
  hintText.setOrigin(0.5);
  
  // 创建combo显示文字（大号黄色）
  comboText = this.add.text(400, 300, 'COMBO: 0', {
    fontSize: '64px',
    fontFamily: 'Arial',
    color: '#ffdd00',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 6
  });
  comboText.setOrigin(0.5);
  
  // 创建状态信息文字
  statusText = this.add.text(400, 400, 'Click to start combo!\n(1 second timeout)', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'center'
  });
  statusText.setOrigin(0.5);
  
  // 创建特效图层（用于闪光效果）
  effectGraphics = this.add.graphics();
  effectGraphics.setDepth(10);
  
  // 创建调试信息
  const debugText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#00ff00'
  });
  
  // 初始化计时器（延迟模式，不立即启动）
  comboTimer = this.time.addEvent({
    delay: 1000,
    callback: resetCombo,
    callbackScope: this,
    paused: true
  });
  
  // 监听点击事件
  this.input.on('pointerdown', function(pointer) {
    // 检查是否点击在黄色区域内
    if (pointer.x >= 200 && pointer.x <= 600 && 
        pointer.y >= 150 && pointer.y <= 450) {
      
      // 增加combo
      gameState.combo++;
      gameState.totalClicks++;
      
      // 更新combo文字
      comboText.setText('COMBO: ' + gameState.combo);
      
      // 文字弹跳动画
      scene.tweens.add({
        targets: comboText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
      
      // 重置并重启计时器
      comboTimer.reset({
        delay: 1000,
        callback: resetCombo,
        callbackScope: scene,
        paused: false
      });
      
      // 更新状态文字
      statusText.setText('Keep clicking!\nCombo: ' + gameState.combo + '/3');
      
      // 检查是否达到3连击
      if (gameState.combo === 3 && !isEffectPlaying) {
        triggerComboEffect.call(scene);
      }
    }
  });
  
  // 更新调试信息
  this.events.on('update', function() {
    debugText.setText(
      'Combo: ' + gameState.combo + '\n' +
      'Total Clicks: ' + gameState.totalClicks + '\n' +
      'Combo Triggered: ' + gameState.comboTriggered + '\n' +
      'Timer Remaining: ' + (comboTimer.paused ? 'Paused' : 
        Math.ceil(comboTimer.getRemaining()) + 'ms')
    );
  });
}

function resetCombo() {
  if (gameState.combo > 0) {
    gameState.combo = 0;
    comboText.setText('COMBO: 0');
    statusText.setText('Combo Reset!\nClick to start again');
    
    // 重置动画
    this.tweens.add({
      targets: comboText,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });
  }
  
  // 暂停计时器
  comboTimer.paused = true;
}

function triggerComboEffect() {
  isEffectPlaying = true;
  gameState.comboTriggered++;
  
  const scene = this;
  
  // 更新状态文字
  statusText.setText('★★★ COMBO x3! ★★★\nAmazing!');
  statusText.setColor('#ffdd00');
  
  // 黄色闪光特效（从中心扩散）
  const flashCount = 3;
  let currentFlash = 0;
  
  const flashInterval = scene.time.addEvent({
    delay: 150,
    repeat: flashCount - 1,
    callback: function() {
      effectGraphics.clear();
      effectGraphics.fillStyle(0xffdd00, 0.6);
      effectGraphics.fillCircle(400, 300, 50);
      
      // 扩散动画
      scene.tweens.add({
        targets: effectGraphics,
        scaleX: 8,
        scaleY: 8,
        alpha: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: function() {
          effectGraphics.clear();
          effectGraphics.setScale(1);
          effectGraphics.setAlpha(1);
        }
      });
      
      currentFlash++;
      if (currentFlash >= flashCount) {
        // 特效结束
        scene.time.delayedCall(500, function() {
          isEffectPlaying = false;
          statusText.setColor('#ffffff');
          statusText.setText('Click to continue!\n(1 second timeout)');
        });
      }
    }
  });
  
  // combo文字特殊动画
  scene.tweens.add({
    targets: comboText,
    scaleX: 1.5,
    scaleY: 1.5,
    angle: 360,
    duration: 600,
    ease: 'Back.easeOut',
    onComplete: function() {
      comboText.setAngle(0);
      comboText.setScale(1);
    }
  });
  
  // 屏幕震动效果
  scene.cameras.main.shake(300, 0.01);
  
  // 黄色背景脉冲
  scene.tweens.add({
    targets: clickArea,
    alpha: 0.5,
    duration: 150,
    yoyo: true,
    repeat: 2
  });
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
}

new Phaser.Game(config);