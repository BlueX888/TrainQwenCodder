// Phaser3 相机跟随示例 - 自动向右移动的矩形
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

let player;
const moveSpeed = 2; // 每帧移动的像素数

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 设置世界边界，让场景足够大以便移动
  this.cameras.main.setBounds(0, 0, 3000, 600);
  this.physics.world.setBounds(0, 0, 3000, 600);

  // 创建 Graphics 对象绘制矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色矩形
  graphics.fillRect(0, 0, 50, 50);
  
  // 生成纹理用于玩家对象
  graphics.generateTexture('playerRect', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 创建玩家对象（使用生成的纹理）
  player = this.add.sprite(100, 300, 'playerRect');
  player.setOrigin(0.5, 0.5);

  // 相机跟随玩家对象
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 可选：设置相机跟随的偏移量，使对象居中
  this.cameras.main.setFollowOffset(0, 0);

  // 添加一些参考点，帮助观察相机移动
  for (let i = 0; i < 3000; i += 200) {
    const marker = this.add.graphics();
    marker.lineStyle(2, 0xffffff, 0.5);
    marker.strokeRect(i, 0, 200, 600);
    
    // 添加位置标记文字
    const text = this.add.text(i + 10, 10, `X: ${i}`, {
      fontSize: '16px',
      color: '#ffffff'
    });
  }

  // 添加提示信息
  const instructions = this.add.text(10, 10, '相机跟随矩形自动向右移动', {
    fontSize: '20px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  instructions.setScrollFactor(0); // 固定在屏幕上，不随相机移动
}

function update(time, delta) {
  // 让玩家对象持续向右移动
  player.x += moveSpeed;

  // 当玩家到达世界边界时停止（可选）
  if (player.x >= 2950) {
    player.x = 2950;
  }
}

// 启动游戏
new Phaser.Game(config);