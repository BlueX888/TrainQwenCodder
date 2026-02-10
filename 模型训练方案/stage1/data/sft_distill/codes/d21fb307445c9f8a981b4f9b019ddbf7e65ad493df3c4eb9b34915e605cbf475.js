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
const followSpeed = 300; // 每秒移动300像素

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 60, 40); // 绘制60x40的矩形
  
  // 生成纹理
  graphics.generateTexture('pinkRect', 60, 40);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建矩形精灵，初始位置在屏幕中心
  rectangle = this.add.sprite(400, 300, 'pinkRect');
  
  // 获取指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 获取鼠标当前位置
  const targetX = pointer.x;
  const targetY = pointer.y;
  
  // 计算矩形中心到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    rectangle.x,
    rectangle.y,
    targetX,
    targetY
  );
  
  // 如果距离大于1像素，则移动（避免抖动）
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      rectangle.x,
      rectangle.y,
      targetX,
      targetY
    );
    
    // 计算本帧应该移动的距离（速度 * 时间）
    const moveDistance = followSpeed * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      rectangle.x = targetX;
      rectangle.y = targetY;
    } else {
      // 根据角度和移动距离更新位置
      rectangle.x += Math.cos(angle) * moveDistance;
      rectangle.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);