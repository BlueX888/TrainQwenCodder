const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let rectangle;
let pointer;
const FOLLOW_SPEED = 300; // 每秒移动的像素数

function preload() {
  // 使用 Graphics 创建白色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('whiteRect', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建白色矩形精灵
  rectangle = this.add.sprite(400, 300, 'whiteRect');
  
  // 获取鼠标指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算矩形中心到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    rectangle.x,
    rectangle.y,
    pointer.x,
    pointer.y
  );
  
  // 只有当距离大于1像素时才移动（避免抖动）
  if (distance > 1) {
    // 计算从矩形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      rectangle.x,
      rectangle.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和 delta 时间计算本帧应移动的距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果剩余距离小于本帧移动距离，直接到达目标点
    if (distance < moveDistance) {
      rectangle.x = pointer.x;
      rectangle.y = pointer.y;
    } else {
      // 根据角度和移动距离更新位置
      rectangle.x += Math.cos(angle) * moveDistance;
      rectangle.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);