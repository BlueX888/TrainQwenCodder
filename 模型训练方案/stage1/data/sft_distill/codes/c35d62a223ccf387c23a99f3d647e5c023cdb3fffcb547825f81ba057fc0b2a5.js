const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let speed = 2;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 设置世界边界，创建一个更大的游戏世界
  this.cameras.main.setBounds(0, 0, 3000, 600);
  this.physics.world.setBounds(0, 0, 3000, 600);

  // 使用 Rectangle 创建一个红色矩形作为玩家对象
  player = this.add.rectangle(100, 300, 50, 50, 0xff0000);
  
  // 添加一些参考点（网格），帮助观察相机跟随效果
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x00ff00, 0.3);
  
  // 绘制垂直网格线
  for (let x = 0; x <= 3000; x += 100) {
    graphics.lineBetween(x, 0, x, 600);
  }
  
  // 绘制水平网格线
  for (let y = 0; y <= 600; y += 100) {
    graphics.lineBetween(0, y, 3000, y);
  }
  
  // 添加位置标记文本
  for (let x = 0; x <= 3000; x += 500) {
    this.add.text(x + 10, 10, `X: ${x}`, {
      fontSize: '16px',
      color: '#ffffff'
    });
  }

  // 设置相机跟随玩家矩形，保持居中
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 可选：设置跟随偏移量（如果需要让对象不在正中心）
  // this.cameras.main.setFollowOffset(0, 0);

  // 添加提示文本（固定在相机上）
  const instruction = this.add.text(10, 10, 'Red rectangle moving right\nCamera follows automatically', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  instruction.setScrollFactor(0); // 固定在相机上，不随世界移动
}

function update(time, delta) {
  // 让矩形自动向右移动
  player.x += speed;

  // 当矩形到达世界边界时，可以选择停止或循环
  if (player.x > 2950) {
    // 到达边界后停止
    speed = 0;
    
    // 或者循环回起点（取消下面的注释）
    // player.x = 50;
  }
}

new Phaser.Game(config);