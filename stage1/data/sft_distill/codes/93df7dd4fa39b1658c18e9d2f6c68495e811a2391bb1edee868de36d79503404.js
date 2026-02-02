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
  // 使用 Graphics 程序化生成红色三角形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 设置红色填充
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制等边三角形（32像素）
  // 三角形顶点：顶部中心、左下、右下
  graphics.fillTriangle(
    16, 4,      // 顶点（中心顶部）
    4, 28,      // 左下角
    28, 28      // 右下角
  );
  
  // 生成纹理，key 为 'triangle'
  graphics.generateTexture('triangle', 32, 32);
  
  // 销毁临时 graphics 对象
  graphics.destroy();
}

function create() {
  // 添加提示文本
  this.add.text(400, 20, 'Click anywhere to create red triangles', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5, 0);
  
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建三角形 sprite
    const triangle = this.add.sprite(pointer.x, pointer.y, 'triangle');
    
    // 可选：添加简单的缩放动画效果
    this.tweens.add({
      targets: triangle,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power1'
    });
  });
}

// 创建游戏实例
new Phaser.Game(config);