const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -40);      // 顶点
  graphics.lineTo(-35, 30);     // 左下角
  graphics.lineTo(35, 30);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 70, 70);
  graphics.destroy();
  
  // 创建三角形 Sprite
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建抖动动画
  // 使用多个随机位置的关键帧来模拟抖动效果
  this.tweens.add({
    targets: triangle,
    x: {
      from: 400,
      to: 400,
      duration: 1000,
      ease: 'Linear'
    },
    y: {
      from: 300,
      to: 300,
      duration: 1000,
      ease: 'Linear'
    },
    // 使用 onUpdate 回调在每帧添加随机偏移
    onUpdate: function(tween, target) {
      // 计算抖动强度（0-1之间）
      const progress = tween.progress;
      const shakeIntensity = 10; // 抖动幅度
      
      // 添加随机偏移
      target.x = 400 + (Math.random() - 0.5) * shakeIntensity * 2;
      target.y = 300 + (Math.random() - 0.5) * shakeIntensity * 2;
    },
    loop: -1, // 无限循环
    repeat: -1
  });
  
  // 添加说明文字
  this.add.text(400, 50, '青色三角形抖动动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '抖动效果：1秒循环一次', {
    fontSize: '16px',
    color: '#00ffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);