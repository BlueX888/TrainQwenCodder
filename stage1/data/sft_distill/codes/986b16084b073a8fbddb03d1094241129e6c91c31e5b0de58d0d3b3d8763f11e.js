const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 120;
const ELLIPSE_WIDTH = 60;
const ELLIPSE_HEIGHT = 40;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 使用 Graphics 绘制绿色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillEllipse(ELLIPSE_WIDTH / 2, ELLIPSE_HEIGHT / 2, ELLIPSE_WIDTH, ELLIPSE_HEIGHT);
  
  // 生成纹理
  graphics.generateTexture('ellipse', ELLIPSE_WIDTH, ELLIPSE_HEIGHT);
  graphics.destroy();
  
  // 创建玩家精灵，初始位置在画布中心
  player = this.add.sprite(400, 300, 'ellipse');
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const moveDistance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -moveDistance;
  } else if (cursors.right.isDown) {
    velocityX = moveDistance;
  }
  
  if (cursors.up.isDown) {
    velocityY = -moveDistance;
  } else if (cursors.down.isDown) {
    velocityY = moveDistance;
  }
  
  // 更新玩家位置
  player.x += velocityX;
  player.y += velocityY;
  
  // 限制在画布边界内（考虑椭圆的半径）
  const halfWidth = ELLIPSE_WIDTH / 2;
  const halfHeight = ELLIPSE_HEIGHT / 2;
  
  player.x = Phaser.Math.Clamp(player.x, halfWidth, config.width - halfWidth);
  player.y = Phaser.Math.Clamp(player.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);