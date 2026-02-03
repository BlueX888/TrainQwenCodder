const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let circle;
let pointer;

function preload() {
  // 使用 Graphics 生成紫色圆形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x9370db, 1); // 紫色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  graphics.generateTexture('purpleCircle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建紫色圆形精灵，初始位置在屏幕中心
  circle = this.add.sprite(400, 300, 'purpleCircle');
  
  // 获取指针对象
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, '移动鼠标，圆形会平滑跟随', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算圆形中心到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    circle.x,
    circle.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于1像素才移动（避免抖动）
  if (distance > 1) {
    // 计算从圆形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      circle.x,
      circle.y,
      pointer.x,
      pointer.y
    );
    
    // 跟随速度为360像素/秒
    const speed = 360;
    
    // 计算本帧应该移动的距离
    const moveDistance = speed * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      circle.x = pointer.x;
      circle.y = pointer.y;
    } else {
      // 根据角度和移动距离计算新位置
      circle.x += Math.cos(angle) * moveDistance;
      circle.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);