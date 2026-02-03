const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let square;
let pointer;
const FOLLOW_SPEED = 300;

function preload() {
  // 使用 Graphics 创建白色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('whiteSquare', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建白色方块精灵
  square = this.add.sprite(400, 300, 'whiteSquare');
  
  // 获取鼠标指针引用
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse to control the white square', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算方块到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    square.x,
    square.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于1像素，则移动方块
  if (distance > 1) {
    // 计算方向向量
    const angle = Phaser.Math.Angle.Between(
      square.x,
      square.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和时间差计算移动距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      square.x = pointer.x;
      square.y = pointer.y;
    } else {
      // 按方向移动
      square.x += Math.cos(angle) * moveDistance;
      square.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);