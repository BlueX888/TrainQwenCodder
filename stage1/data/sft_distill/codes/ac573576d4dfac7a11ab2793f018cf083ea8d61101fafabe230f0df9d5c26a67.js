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

// 星形对象和按键引用
let star;
let keyW, keyA, keyS, keyD;
const SPEED = 240; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建星形图形
  star = this.add.graphics();
  star.x = 400;
  star.y = 300;
  
  // 绘制黄色星形
  star.fillStyle(0xffff00, 1);
  star.fillStar(0, 0, 5, 20, 40); // 5个角，内半径20，外半径40
  
  // 添加描边使星形更明显
  star.lineStyle(2, 0xffa500, 1);
  star.strokeStar(0, 0, 5, 20, 40);
  
  // 设置 WASD 按键
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
  // 计算本帧应该移动的距离 = 速度 * 时间（秒）
  const distance = SPEED * (delta / 1000);
  
  // 处理垂直移动（W/S）
  if (keyW.isDown) {
    star.y -= distance;
  } else if (keyS.isDown) {
    star.y += distance;
  }
  
  // 处理水平移动（A/D）
  if (keyA.isDown) {
    star.x -= distance;
  } else if (keyD.isDown) {
    star.x += distance;
  }
  
  // 限制星形在画布范围内
  star.x = Phaser.Math.Clamp(star.x, 0, 800);
  star.y = Phaser.Math.Clamp(star.y, 0, 600);
}

new Phaser.Game(config);