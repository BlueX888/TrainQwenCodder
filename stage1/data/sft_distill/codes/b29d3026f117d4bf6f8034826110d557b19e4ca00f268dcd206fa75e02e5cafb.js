const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 80;
const RADIUS = 20;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(RADIUS, RADIUS, RADIUS);
  graphics.generateTexture('playerCircle', RADIUS * 2, RADIUS * 2);
  graphics.destroy();
  
  // 创建玩家精灵，初始位置在画布中心
  player = this.add.sprite(400, 300, 'playerCircle');
  
  // 创建方向键监听
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（像素/秒 * 秒 = 像素）
  const moveDistance = SPEED * (delta / 1000);
  
  // 根据按键状态移动玩家
  if (cursors.left.isDown) {
    player.x -= moveDistance;
  }
  if (cursors.right.isDown) {
    player.x += moveDistance;
  }
  if (cursors.up.isDown) {
    player.y -= moveDistance;
  }
  if (cursors.down.isDown) {
    player.y += moveDistance;
  }
  
  // 限制玩家位置在画布边界内
  player.x = Phaser.Math.Clamp(player.x, RADIUS, config.width - RADIUS);
  player.y = Phaser.Math.Clamp(player.y, RADIUS, config.height - RADIUS);
}

new Phaser.Game(config);