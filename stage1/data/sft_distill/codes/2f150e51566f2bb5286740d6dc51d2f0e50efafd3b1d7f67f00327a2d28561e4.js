const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 预先生成红色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制一个等边三角形（中心在16,16，边长32）
  const size = 32;
  const height = size * Math.sqrt(3) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // 计算三角形三个顶点（顶点朝上）
  const x1 = centerX;
  const y1 = centerY - height * 2 / 3;
  const x2 = centerX - size / 2;
  const y2 = centerY + height / 3;
  const x3 = centerX + size / 2;
  const y3 = centerY + height / 3;
  
  graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  graphics.generateTexture('redTriangle', size, size);
  graphics.destroy();
}

function create() {
  // 添加提示文本
  this.add.text(400, 20, '点击画布任意位置生成红色三角形', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5, 0);
  
  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建三角形图像
    const triangle = this.add.image(pointer.x, pointer.y, 'redTriangle');
    triangle.setOrigin(0.5, 0.5);
    
    // 添加简单的缩放动画效果
    this.tweens.add({
      targets: triangle,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  });
}

new Phaser.Game(config);