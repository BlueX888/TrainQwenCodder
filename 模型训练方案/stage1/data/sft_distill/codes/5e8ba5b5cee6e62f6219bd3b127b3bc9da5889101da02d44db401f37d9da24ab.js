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
const FOLLOW_SPEED = 300;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建粉色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 60, 40);
  graphics.generateTexture('pinkRect', 60, 40);
  graphics.destroy();

  // 创建矩形精灵对象，初始位置在屏幕中心
  rectangle = this.add.sprite(400, 300, 'pinkRect');
  
  // 获取鼠标指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
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
    
    // 计算本帧应该移动的距离
    const moveDistance = Math.min(FOLLOW_SPEED * deltaSeconds, distance);
    
    // 根据角度和移动距离更新矩形位置
    rectangle.x += Math.cos(angle) * moveDistance;
    rectangle.y += Math.sin(angle) * moveDistance;
  }
}

new Phaser.Game(config);