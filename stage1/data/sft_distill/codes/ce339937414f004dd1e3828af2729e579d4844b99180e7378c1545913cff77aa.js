// 完整的 Phaser3 相机跟随示例
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

// 全局变量存储移动的矩形
let movingRect;
let speed = 2; // 移动速度

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 设置世界边界，使其比屏幕大，以便矩形可以移动
  this.cameras.main.setBounds(0, 0, 2400, 600);
  this.physics.world.setBounds(0, 0, 2400, 600);

  // 创建一个矩形对象（使用 Rectangle 游戏对象）
  movingRect = this.add.rectangle(1200, 300, 50, 50, 0xff0000);
  
  // 添加一些背景参考物，帮助观察相机跟随效果
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0x00ff00, 0.5);
  
  // 绘制网格作为参考
  for (let x = 0; x <= 2400; x += 100) {
    graphics.lineBetween(x, 0, x, 600);
  }
  for (let y = 0; y <= 600; y += 100) {
    graphics.lineBetween(0, y, 2400, y);
  }
  
  // 添加一些固定位置的参考矩形
  this.add.rectangle(400, 300, 30, 30, 0x00ffff);
  this.add.rectangle(800, 300, 30, 30, 0xffff00);
  this.add.rectangle(1600, 300, 30, 30, 0xff00ff);
  this.add.rectangle(2000, 300, 30, 30, 0x00ff00);
  
  // 设置相机跟随移动的矩形
  // startFollow(target, roundPixels, lerpX, lerpY)
  // roundPixels: 是否四舍五入像素，避免抖动
  // lerpX, lerpY: 跟随平滑度 (0-1)，值越小越平滑
  this.cameras.main.startFollow(movingRect, true, 0.1, 0.1);
  
  // 添加文本提示（固定在相机上）
  const text = this.add.text(10, 10, '红色矩形自动向左移动\n相机跟随保持居中', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随世界移动
}

function update(time, delta) {
  // 让矩形持续向左移动
  movingRect.x -= speed;
  
  // 当矩形移动到世界左边界时，重置到右边
  if (movingRect.x < 0) {
    movingRect.x = 2400;
  }
  
  // 也可以在到达边界时停止
  // if (movingRect.x < 25) {
  //   movingRect.x = 25;
  // }
}

// 启动游戏
new Phaser.Game(config);