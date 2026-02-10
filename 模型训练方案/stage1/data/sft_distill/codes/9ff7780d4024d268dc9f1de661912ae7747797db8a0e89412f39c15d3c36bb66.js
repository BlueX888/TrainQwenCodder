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
let keys;
const SPEED = 200; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形并生成纹理
  const graphics = this.add.graphics();
  
  // 设置星形样式
  graphics.fillStyle(0xffff00, 1); // 黄色星形
  graphics.lineStyle(2, 0xffa500, 1); // 橙色边框
  
  // 绘制五角星（中心点在 32, 32）
  graphics.fillStar(32, 32, 5, 10, 25, 0);
  graphics.strokeStar(32, 32, 5, 10, 25, 0);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 64, 64);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建星形精灵，初始位置在屏幕中心
  star = this.add.sprite(400, 300, 'starTexture');
  
  // 设置 WASD 键盘输入
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the star', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧应该移动的距离
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态移动星形
  if (keys.w.isDown) {
    star.y -= distance; // 向上移动
  }
  if (keys.s.isDown) {
    star.y += distance; // 向下移动
  }
  if (keys.a.isDown) {
    star.x -= distance; // 向左移动
  }
  if (keys.d.isDown) {
    star.x += distance; // 向右移动
  }
  
  // 限制星形在屏幕范围内
  star.x = Phaser.Math.Clamp(star.x, 0, 800);
  star.y = Phaser.Math.Clamp(star.y, 0, 600);
}

// 启动游戏
new Phaser.Game(config);