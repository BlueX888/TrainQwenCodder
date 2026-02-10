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

let blueRect;
let pointer;
const followSpeed = 80; // 跟随速度

function preload() {
  // 使用 Graphics 创建蓝色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillRect(0, 0, 60, 60);
  graphics.generateTexture('blueRect', 60, 60);
  graphics.destroy();
}

function create() {
  // 创建蓝色矩形精灵，初始位置在屏幕中心
  blueRect = this.add.sprite(400, 300, 'blueRect');
  
  // 获取鼠标指针对象
  pointer = this.input.activePointer;
  
  // 添加提示文字
  this.add.text(10, 10, 'Move your mouse to see the blue rectangle follow', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算跟随因子（基于时间差和跟随速度）
  // delta 是毫秒，除以 1000 转换为秒
  const lerpFactor = Math.min(1, (followSpeed * delta) / 1000);
  
  // 使用线性插值平滑移动到鼠标位置
  blueRect.x = Phaser.Math.Linear(blueRect.x, pointer.x, lerpFactor);
  blueRect.y = Phaser.Math.Linear(blueRect.y, pointer.y, lerpFactor);
}

new Phaser.Game(config);