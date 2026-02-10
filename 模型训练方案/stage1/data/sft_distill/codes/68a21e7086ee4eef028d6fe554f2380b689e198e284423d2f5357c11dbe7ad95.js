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

// 游戏状态变量（可验证）
let combo = 0;
let comboText;
let clickArea;
let comboTimer;
let effectGraphics;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建点击区域（青色矩形）
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00FFFF, 0.3);
  graphics.fillRoundedRect(250, 200, 300, 200, 10);
  graphics.lineStyle(3, 0x00FFFF, 1);
  graphics.strokeRoundedRect(250, 200, 300, 200, 10);
  
  // 创建提示文本
  const hintText = this.add.text(400, 250, 'Click Here!', {
    fontSize: '32px',
    color: '#00FFFF',
    fontStyle: 'bold'
  });
  hintText.setOrigin(0.5);
  
  // 创建combo显示文本
  comboText = this.add.text(400, 320, 'Combo: 0', {
    fontSize: '48px',
    color: '#FFFFFF',
    fontStyle: 'bold'
  });
  comboText.setOrigin(0.5);
  
  // 创建说明文本
  const instructionText = this.add.text(400, 500, '2秒内连续点击增加Combo\n连击3次触发特效！', {
    fontSize: '20px',
    color: '#AAAAAA',
    align: 'center'
  });
  instructionText.setOrigin(0.5);
  
  // 创建特效图形对象
  effectGraphics = this.add.graphics();
  
  // 创建点击区域（交互区域）
  clickArea = this.add.zone(250, 200, 300, 200).setOrigin(0, 0).setInteractive();
  
  // 初始化计时器（但不启动）
  comboTimer = this.time.addEvent({
    delay: 2000,
    callback: resetCombo,
    callbackScope: this,
    loop: false,
    paused: true
  });
  
  // 监听点击事件
  clickArea.on('pointerdown', () => {
    handleClick(this);
  });
  
  // 添加调试信息
  const debugText = this.add.text(10, 10, 'Debug: Combo = 0', {
    fontSize: '16px',
    color: '#00FF00'
  });
  
  // 存储调试文本以便更新
  this.debugText = debugText;
}

function handleClick(scene) {
  // 增加combo
  combo++;
  
  // 更新显示
  updateComboDisplay(scene);
  
  // 重置计时器
  if (comboTimer) {
    comboTimer.reset({
      delay: 2000,
      callback: resetCombo,
      callbackScope: scene,
      loop: false
    });
  }
  
  // 检查是否达到连击3次
  if (combo === 3) {
    triggerComboEffect(scene);
  }
  
  // 点击反馈动画
  scene.tweens.add({
    targets: comboText,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 100,
    yoyo: true,
    ease: 'Power2'
  });
}

function updateComboDisplay(scene) {
  comboText.setText(`Combo: ${combo}`);
  
  // 根据combo数量改变颜色
  if (combo >= 3) {
    comboText.setColor('#00FFFF'); // 青色
  } else if (combo >= 2) {
    comboText.setColor('#FFFF00'); // 黄色
  } else {
    comboText.setColor('#FFFFFF'); // 白色
  }
  
  // 更新调试信息
  if (scene.debugText) {
    scene.debugText.setText(`Debug: Combo = ${combo}`);
  }
}

function resetCombo() {
  combo = 0;
  updateComboDisplay(this);
  
  // 重置文本颜色
  comboText.setColor('#FFFFFF');
  
  console.log('Combo reset to 0');
}

function triggerComboEffect(scene) {
  console.log('Combo 3 achieved! Triggering effect...');
  
  // 创建多个青色圆形扩散特效
  for (let i = 0; i < 3; i++) {
    scene.time.delayedCall(i * 150, () => {
      createRippleEffect(scene, 400, 320);
    });
  }
  
  // 屏幕闪烁效果
  const flash = scene.add.graphics();
  flash.fillStyle(0x00FFFF, 0.3);
  flash.fillRect(0, 0, 800, 600);
  
  scene.tweens.add({
    targets: flash,
    alpha: 0,
    duration: 500,
    onComplete: () => {
      flash.destroy();
    }
  });
}

function createRippleEffect(scene, x, y) {
  // 创建圆形图形
  const circle = scene.add.graphics();
  circle.lineStyle(4, 0x00FFFF, 1);
  circle.strokeCircle(0, 0, 20);
  circle.setPosition(x, y);
  
  // 扩散动画
  scene.tweens.add({
    targets: circle,
    scaleX: 4,
    scaleY: 4,
    alpha: 0,
    duration: 800,
    ease: 'Power2',
    onComplete: () => {
      circle.destroy();
    }
  });
  
  // 创建填充圆
  const fillCircle = scene.add.graphics();
  fillCircle.fillStyle(0x00FFFF, 0.6);
  fillCircle.fillCircle(0, 0, 15);
  fillCircle.setPosition(x, y);
  
  scene.tweens.add({
    targets: fillCircle,
    scaleX: 3,
    scaleY: 3,
    alpha: 0,
    duration: 600,
    ease: 'Power2',
    onComplete: () => {
      fillCircle.destroy();
    }
  });
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
}

// 启动游戏
new Phaser.Game(config);