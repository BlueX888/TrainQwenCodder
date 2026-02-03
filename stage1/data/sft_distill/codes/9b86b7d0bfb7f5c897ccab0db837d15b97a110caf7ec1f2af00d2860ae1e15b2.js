const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建灰色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制等边三角形（中心点在原点）
  const size = 60;
  const height = size * Math.sqrt(3) / 2;
  graphics.beginPath();
  graphics.moveTo(0, -height * 2/3); // 顶点
  graphics.lineTo(-size/2, height * 1/3); // 左下
  graphics.lineTo(size/2, height * 1/3); // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', size + 10, height + 10);
  graphics.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建抖动动画
  // 抖动效果：快速在小范围内随机位移
  this.tweens.add({
    targets: triangle,
    x: {
      value: '+=8', // 向右偏移
      duration: 50,
      ease: 'Linear',
      yoyo: true,
      repeat: 0
    },
    y: {
      value: '+=5', // 向下偏移
      duration: 50,
      ease: 'Linear',
      yoyo: true,
      repeat: 0
    },
    duration: 50,
    yoyo: true,
    repeat: 24, // 50ms * 2(yoyo) * 25 = 2500ms
    ease: 'Sine.easeInOut',
    loop: -1, // 无限循环
    onRepeat: function() {
      // 每次重复时随机改变抖动方向，增加真实感
      const randomX = Phaser.Math.Between(-8, 8);
      const randomY = Phaser.Math.Between(-8, 8);
      triangle.x = 400 + randomX;
      triangle.y = 300 + randomY;
    }
  });
  
  // 添加标题文字
  this.add.text(400, 50, '抖动三角形', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '2.5秒循环抖动', {
    fontSize: '20px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

new Phaser.Game(config);