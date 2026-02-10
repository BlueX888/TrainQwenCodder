const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let player;
const FOLLOW_SPEED = 300;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建黄色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('yellowSquare', 50, 50);
  graphics.destroy();

  // 创建方块精灵，初始位置在屏幕中心
  player = this.add.sprite(400, 300, 'yellowSquare');
  
  // 添加提示文本
  this.add.text(10, 10, '移动鼠标，黄色方块会跟随', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  
  // 计算方块到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    player.x,
    player.y,
    pointer.x,
    pointer.y
  );
  
  // 只有当距离大于一定阈值时才移动，避免抖动
  if (distance > 5) {
    // 计算方块到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      player.x,
      player.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和时间计算移动距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果移动距离大于实际距离，直接到达目标位置
    if (moveDistance >= distance) {
      player.x = pointer.x;
      player.y = pointer.y;
    } else {
      // 否则按照角度和速度移动
      player.x += Math.cos(angle) * moveDistance;
      player.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);