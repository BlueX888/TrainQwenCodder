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
const FOLLOW_SPEED = 300; // 跟随速度（像素/秒）

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 60, 40); // 绘制 60x40 的矩形
  
  // 生成纹理
  graphics.generateTexture('pinkRect', 60, 40);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建矩形精灵，初始位置在画布中心
  rectangle = this.add.sprite(400, 300, 'pinkRect');
  
  // 获取指针对象
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse to see the pink rectangle follow!', {
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
  
  // 如果距离大于1像素才移动（避免抖动）
  if (distance > 1) {
    // 计算从矩形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      rectangle.x,
      rectangle.y,
      pointer.x,
      pointer.y
    );
    
    // 计算本帧应移动的距离（速度 * 时间）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标点
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