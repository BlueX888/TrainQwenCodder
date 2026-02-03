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
  // 无需预加载外部资源
}

function create() {
  // 创建青色六边形纹理
  const graphics = this.add.graphics();
  
  // 绘制六边形
  const hexRadius = 50;
  const hexPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = hexRadius + Math.cos(angle) * hexRadius;
    const y = hexRadius + Math.sin(angle) * hexRadius;
    hexPoints.push(x, y);
  }
  
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.lineStyle(3, 0x00cccc, 1); // 深青色边框
  graphics.beginPath();
  graphics.moveTo(hexPoints[0], hexPoints[1]);
  
  for (let i = 2; i < hexPoints.length; i += 2) {
    graphics.lineTo(hexPoints[i], hexPoints[i + 1]);
  }
  
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建抖动动画
  // 使用多个连续的 tween 来实现随机抖动效果
  const shakeIntensity = 8; // 抖动强度
  const shakeDuration = 50; // 每次抖动持续时间
  const totalDuration = 4000; // 总时长 4 秒
  const shakeCount = totalDuration / shakeDuration; // 抖动次数
  
  // 创建抖动时间轴
  const timeline = this.tweens.timeline({
    targets: hexagon,
    loop: -1, // 无限循环
    loopDelay: 0
  });
  
  // 添加多个抖动帧
  for (let i = 0; i < shakeCount; i++) {
    const offsetX = Phaser.Math.Between(-shakeIntensity, shakeIntensity);
    const offsetY = Phaser.Math.Between(-shakeIntensity, shakeIntensity);
    
    timeline.add({
      x: 400 + offsetX,
      y: 300 + offsetY,
      duration: shakeDuration,
      ease: 'Linear'
    });
  }
  
  // 最后回到原点
  timeline.add({
    x: 400,
    y: 300,
    duration: shakeDuration,
    ease: 'Linear'
  });
  
  timeline.play();
  
  // 添加说明文字
  this.add.text(400, 500, '青色六边形抖动动画 (4秒循环)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);