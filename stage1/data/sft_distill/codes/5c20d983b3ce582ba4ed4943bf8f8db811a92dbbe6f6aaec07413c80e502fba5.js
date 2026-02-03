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
let keyW, keyA, keyS, keyD;
const SPEED = 240; // 像素/秒

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制五角星
  // 参数：x, y, points(角数), innerRadius(内半径), outerRadius(外半径)
  graphics.fillStar(32, 32, 5, 12, 28);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 64, 64);
  graphics.destroy();
  
  // 创建星形精灵，放置在屏幕中心
  star = this.add.sprite(400, 300, 'starTexture');
  
  // 添加 WASD 键监听
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算移动距离
  const moveDistance = SPEED * deltaSeconds;
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测按键状态并设置速度方向
  if (keyW.isDown) {
    velocityY = -1; // 向上
  }
  if (keyS.isDown) {
    velocityY = 1; // 向下
  }
  if (keyA.isDown) {
    velocityX = -1; // 向左
  }
  if (keyD.isDown) {
    velocityX = 1; // 向右
  }
  
  // 如果同时按下多个键，需要归一化速度向量
  if (velocityX !== 0 && velocityY !== 0) {
    // 对角线移动时，保持速度恒定（避免斜向移动更快）
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新星形位置
  star.x += velocityX * moveDistance;
  star.y += velocityY * moveDistance;
  
  // 边界限制（可选，防止星形移出屏幕）
  star.x = Phaser.Math.Clamp(star.x, 0, 800);
  star.y = Phaser.Math.Clamp(star.y, 0, 600);
}

// 创建游戏实例
new Phaser.Game(config);