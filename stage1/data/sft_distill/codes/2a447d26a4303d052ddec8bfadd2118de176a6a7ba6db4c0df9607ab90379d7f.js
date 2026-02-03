const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量
let animationActive = false;
let objectsArray = [];
let tweensArray = [];
let statusText;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建状态文本
  statusText = this.add.text(400, 50, 'Animation: Waiting', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);

  // 创建10个圆形物体
  const startX = 150;
  const spacing = 70;
  const yPos = 300;
  
  for (let i = 0; i < 10; i++) {
    // 使用Graphics绘制圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff88, 1);
    graphics.fillCircle(0, 0, 25);
    
    // 生成纹理
    graphics.generateTexture(`circle${i}`, 50, 50);
    graphics.destroy();
    
    // 创建精灵对象
    const sprite = this.add.sprite(startX + i * spacing, yPos, `circle${i}`);
    sprite.setAlpha(1);
    
    objectsArray.push(sprite);
  }

  // 创建同步淡入淡出动画
  for (let i = 0; i < objectsArray.length; i++) {
    const tween = this.tweens.add({
      targets: objectsArray[i],
      alpha: 0,
      duration: 1000,
      yoyo: true,
      repeat: -1, // 无限循环
      ease: 'Sine.easeInOut'
    });
    
    tweensArray.push(tween);
  }

  // 标记动画开始
  animationActive = true;
  statusText.setText('Animation: Active (10 objects)');

  // 4秒后停止所有动画
  this.time.delayedCall(4000, () => {
    // 停止所有tween
    tweensArray.forEach(tween => {
      tween.stop();
    });
    
    // 将所有物体alpha设置为1（完全可见）
    objectsArray.forEach(obj => {
      obj.setAlpha(1);
    });
    
    // 更新状态
    animationActive = false;
    statusText.setText('Animation: Stopped');
    
    console.log('Animation stopped after 4 seconds');
  });

  // 添加说明文本
  this.add.text(400, 500, '10 objects fading in/out synchronously', {
    fontSize: '18px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);

  this.add.text(400, 530, 'Animation will stop after 4 seconds', {
    fontSize: '18px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 可选：显示运行时间
  if (animationActive) {
    const elapsedSeconds = Math.floor(time / 1000);
    // 可在此添加额外的状态更新逻辑
  }
}

new Phaser.Game(config);