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

let rectangle;
let pointer;
const FOLLOW_SPEED = 120; // 每秒移动的像素数

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建白色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('whiteRect', 50, 50);
  graphics.destroy();

  // 创建矩形精灵，初始位置在屏幕中心
  rectangle = this.add.sprite(400, 300, 'whiteRect');
  
  // 获取指针引用
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse to see the rectangle follow', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算矩形中心到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    rectangle.x,
    rectangle.y,
    pointer.x,
    pointer.y
  );
  
  // 只有当距离大于一个很小的阈值时才移动（避免抖动）
  if (distance > 1) {
    // 计算从矩形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      rectangle.x,
      rectangle.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和 delta 时间计算本帧应该移动的距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标位置
    if (moveDistance >= distance) {
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