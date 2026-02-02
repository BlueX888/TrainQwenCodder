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
  // 无需预加载资源
}

function create() {
  // 添加提示文字
  this.add.text(400, 50, '点击画布任意位置生成橙色星形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置橙色填充
    graphics.fillStyle(0xff8800, 1);
    
    // 在点击位置绘制星形
    // fillStar(x, y, points, innerRadius, outerRadius)
    // 64像素星形，外半径32，内半径16
    graphics.fillStar(pointer.x, pointer.y, 5, 16, 32);
    
    // 可选：添加描边使星形更明显
    graphics.lineStyle(2, 0xffaa00, 1);
    graphics.strokeStar(pointer.x, pointer.y, 5, 16, 32);
  });
}

new Phaser.Game(config);