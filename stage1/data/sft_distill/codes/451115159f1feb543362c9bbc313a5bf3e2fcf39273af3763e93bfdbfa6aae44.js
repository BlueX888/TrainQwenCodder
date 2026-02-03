const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 绘制星形并生成纹理
  const graphics = this.add.graphics();
  
  // 设置黄色填充
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制星形 (中心点, 外半径, 内半径, 星形顶点数)
  // 24像素大小，所以外半径为12，内半径为5
  graphics.fillStar(12, 12, 5, 12, 5, 0);
  
  // 生成纹理
  graphics.generateTexture('star', 24, 24);
  
  // 销毁 graphics 对象释放内存
  graphics.destroy();
}

function create() {
  // 添加提示文字
  this.add.text(400, 50, '点击画布任意位置生成星形', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建星形图像
    const star = this.add.image(pointer.x, pointer.y, 'star');
    
    // 可选：添加一些视觉效果
    // 初始缩放为0，然后弹出
    star.setScale(0);
    this.tweens.add({
      targets: star,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  });
}

new Phaser.Game(config);