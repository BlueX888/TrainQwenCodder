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
  // 创建星形纹理（只需创建一次）
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  
  // 绘制星形（中心在32,32，外半径32，内半径16，5个角）
  graphics.fillStar(32, 32, 5, 16, 32);
  
  // 生成64x64的纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy(); // 销毁graphics对象，纹理已生成
  
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建星形图像
    const star = this.add.image(pointer.x, pointer.y, 'star');
    
    // 可选：添加一个简单的缩放动画效果
    star.setScale(0);
    this.tweens.add({
      targets: star,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 30, '点击画布任意位置生成橙色星形', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);