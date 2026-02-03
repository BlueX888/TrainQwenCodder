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

// 星形对象和按键
let star;
let keyW, keyA, keyS, keyD;
const speed = 240; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制星形
  star = this.add.graphics();
  star.x = 400; // 初始位置 x
  star.y = 300; // 初始位置 y
  
  // 绘制黄色星形
  star.fillStyle(0xffff00, 1);
  star.fillStar(0, 0, 5, 20, 40); // 中心点(0,0)，5个角，内半径20，外半径40
  
  // 添加 WASD 键监听
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the star', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离 = 速度 * 时间增量（转换为秒）
  const distance = speed * (delta / 1000);
  
  // 根据按键状态移动星形
  if (keyW.isDown) {
    star.y -= distance; // 向上移动
  }
  if (keyS.isDown) {
    star.y += distance; // 向下移动
  }
  if (keyA.isDown) {
    star.x -= distance; // 向左移动
  }
  if (keyD.isDown) {
    star.x += distance; // 向右移动
  }
  
  // 边界限制（可选）
  star.x = Phaser.Math.Clamp(star.x, 0, 800);
  star.y = Phaser.Math.Clamp(star.y, 0, 600);
}

new Phaser.Game(config);