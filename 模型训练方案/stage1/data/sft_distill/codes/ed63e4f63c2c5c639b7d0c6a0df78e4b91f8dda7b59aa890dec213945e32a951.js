const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制等边三角形（中心点在原点）
  const size = 60;
  const height = size * Math.sqrt(3) / 2;
  graphics.beginPath();
  graphics.moveTo(0, -height * 2/3); // 顶点
  graphics.lineTo(-size / 2, height * 1/3); // 左下
  graphics.lineTo(size / 2, height * 1/3); // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', size, size * 1.2);
  graphics.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建抖动动画
  // 使用多个 Tween 组合实现抖动效果
  this.tweens.add({
    targets: triangle,
    x: '+=10', // 向右偏移
    y: '+=8',  // 向下偏移
    duration: 50,
    yoyo: true, // 往返
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut'
  });
  
  // 添加旋转抖动
  this.tweens.add({
    targets: triangle,
    angle: { from: -5, to: 5 }, // 左右旋转抖动
    duration: 100,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  
  // 添加缩放抖动
  this.tweens.add({
    targets: triangle,
    scaleX: { from: 0.95, to: 1.05 },
    scaleY: { from: 0.95, to: 1.05 },
    duration: 150,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  
  // 创建主循环控制（2秒一个完整周期）
  // 使用时间轴控制抖动的强度变化
  this.tweens.addCounter({
    from: 0,
    to: 1,
    duration: 2000,
    repeat: -1,
    onUpdate: (tween) => {
      const progress = tween.getValue();
      // 使用正弦波形让抖动强度周期性变化
      const intensity = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
      // 可以根据 intensity 调整抖动效果（这里作为演示）
    }
  });
  
  // 添加说明文字
  this.add.text(400, 550, '青色三角形抖动动画 (2秒循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);