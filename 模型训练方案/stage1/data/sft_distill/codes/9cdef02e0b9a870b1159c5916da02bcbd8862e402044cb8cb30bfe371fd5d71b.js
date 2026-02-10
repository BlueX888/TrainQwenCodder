const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let rectangle;
let pointer;
const followSpeed = 300; // 每秒移动 300 像素

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建白色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 60, 40);
  graphics.generateTexture('whiteRect', 60, 40);
  graphics.destroy();

  // 创建矩形精灵，初始位置在屏幕中心
  rectangle = this.add.sprite(400, 300, 'whiteRect');
  
  // 获取鼠标指针引用
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, '移动鼠标，白色矩形会平滑跟随', {
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
  
  // 只有当距离大于一定阈值时才移动，避免抖动
  if (distance > 2) {
    // 计算从矩形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      rectangle.x,
      rectangle.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和 delta 时间计算本帧应移动的距离
    const moveDistance = followSpeed * (delta / 1000);
    
    // 如果本帧移动距离大于实际距离，直接到达目标位置
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