const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let star;
let moveSpeed = 150; // 每秒移动的像素数

function preload() {
  // 使用 Graphics 创建星形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制黄色星形
  graphics.fillStyle(0xffff00, 1);
  graphics.fillStar(32, 32, 5, 16, 30, 0);
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建一个大的世界边界，让星形有足够的移动空间
  this.cameras.main.setBounds(-2000, 0, 4000, 600);
  
  // 在场景右侧创建星形
  star = this.add.sprite(400, 300, 'star');
  star.setOrigin(0.5, 0.5);
  
  // 设置相机跟随星形，保持居中
  this.cameras.main.startFollow(star, true, 0.1, 0.1);
  
  // 添加一些参考背景元素，帮助观察相机移动
  const graphics = this.add.graphics();
  
  // 绘制网格作为参考
  graphics.lineStyle(1, 0x444444, 0.5);
  for (let x = -2000; x < 2000; x += 100) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, 600);
  }
  for (let y = 0; y < 600; y += 100) {
    graphics.moveTo(-2000, y);
    graphics.lineTo(2000, y);
  }
  graphics.strokePath();
  
  // 添加一些静态的圆形作为参考点
  for (let i = -10; i < 10; i++) {
    const circle = this.add.graphics();
    circle.fillStyle(0x00ff00, 0.3);
    circle.fillCircle(i * 200, 300, 20);
  }
  
  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随星形向左移动', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定文本在屏幕上，不随相机移动
}

function update(time, delta) {
  // 让星形持续向左移动
  // delta 是毫秒，转换为秒
  star.x -= moveSpeed * (delta / 1000);
  
  // 可选：当星形移动到很远的位置时重置（循环效果）
  if (star.x < -1500) {
    star.x = 1500;
  }
}

// 启动游戏
new Phaser.Game(config);