const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let follower;
const FOLLOW_SPEED = 360; // 每秒移动360像素

function preload() {
  // 使用 Graphics 创建橙色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillCircle(25, 25, 25); // 半径25的圆
  graphics.generateTexture('orangeCircle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建跟随者精灵，初始位置在屏幕中心
  follower = this.add.sprite(400, 300, 'orangeCircle');
  
  // 添加提示文本
  this.add.text(10, 10, '移动鼠标，橙色圆形会平滑跟随', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  
  // 计算圆形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    follower.x,
    follower.y,
    pointer.x,
    pointer.y
  );
  
  // 只有当距离大于1像素时才移动（避免抖动）
  if (distance > 1) {
    // 计算圆形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      follower.x,
      follower.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和delta时间计算本帧应移动的距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果本帧移动距离大于剩余距离，则直接到达目标点
    if (moveDistance >= distance) {
      follower.x = pointer.x;
      follower.y = pointer.y;
    } else {
      // 根据角度和移动距离计算新位置
      follower.x += Math.cos(angle) * moveDistance;
      follower.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);