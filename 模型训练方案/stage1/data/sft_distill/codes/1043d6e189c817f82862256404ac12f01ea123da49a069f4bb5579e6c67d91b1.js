const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: false
    }
  },
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  gravityChanges: [],
  playerPosition: { x: 0, y: 0 },
  currentGravity: { x: 0, y: 800, direction: 'DOWN' }
};

let player;
let gravityText;
let cursors;
let currentGravityDirection = 'DOWN';
let lastGravityChangeTime = 0;
const GRAVITY_COOLDOWN = 100; // 防止频繁切换

function preload() {
  // 程序化生成玩家纹理
  const graphics = this.add.graphics();
  
  // 绘制玩家（蓝色方块）
  graphics.fillStyle(0x00d4ff, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokeRect(0, 0, 40, 40);
  
  // 添加方向指示器（小三角形）
  graphics.fillStyle(0xffff00, 1);
  graphics.fillTriangle(20, 10, 15, 20, 25, 20);
  
  graphics.generateTexture('player', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 100, 'player');
  player.setBounce(0.3);
  player.setCollideWorldBounds(true);
  player.setMaxVelocity(600, 600);
  
  // 创建键盘输入
  cursors = this.input.keyboard.addKeys({
    W: Phaser.Input.Keyboard.KeyCodes.W,
    A: Phaser.Input.Keyboard.KeyCodes.A,
    S: Phaser.Input.Keyboard.KeyCodes.S,
    D: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 创建重力方向显示文本
  gravityText = this.add.text(20, 20, 'Gravity: DOWN (800)', {
    fontSize: '24px',
    fill: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  gravityText.setDepth(100);
  
  // 创建操作提示
  this.add.text(20, 560, 'Press W/A/S/D to change gravity direction', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 创建边界视觉效果
  const boundaryGraphics = this.add.graphics();
  boundaryGraphics.lineStyle(4, 0xff6b6b, 1);
  boundaryGraphics.strokeRect(2, 2, 796, 596);
  
  // 初始化信号
  window.__signals__.currentGravity = { x: 0, y: 800, direction: 'DOWN' };
  
  console.log('[INIT] Game started with gravity DOWN (800)');
}

function update(time, delta) {
  const currentTime = time;
  
  // 检测WASD按键切换重力方向
  if (currentTime - lastGravityChangeTime > GRAVITY_COOLDOWN) {
    let gravityChanged = false;
    let newDirection = currentGravityDirection;
    let newGravityX = 0;
    let newGravityY = 0;
    
    if (Phaser.Input.Keyboard.JustDown(cursors.W)) {
      // W键：重力向上
      newGravityX = 0;
      newGravityY = -800;
      newDirection = 'UP';
      gravityChanged = true;
      player.setAngle(180);
    } else if (Phaser.Input.Keyboard.JustDown(cursors.S)) {
      // S键：重力向下
      newGravityX = 0;
      newGravityY = 800;
      newDirection = 'DOWN';
      gravityChanged = true;
      player.setAngle(0);
    } else if (Phaser.Input.Keyboard.JustDown(cursors.A)) {
      // A键：重力向左
      newGravityX = -800;
      newGravityY = 0;
      newDirection = 'LEFT';
      gravityChanged = true;
      player.setAngle(270);
    } else if (Phaser.Input.Keyboard.JustDown(cursors.D)) {
      // D键：重力向右
      newGravityX = 800;
      newGravityY = 0;
      newDirection = 'RIGHT';
      gravityChanged = true;
      player.setAngle(90);
    }
    
    if (gravityChanged) {
      // 更新物理世界重力
      this.physics.world.gravity.x = newGravityX;
      this.physics.world.gravity.y = newGravityY;
      
      currentGravityDirection = newDirection;
      lastGravityChangeTime = currentTime;
      
      // 更新文本显示
      gravityText.setText(`Gravity: ${newDirection} (800)`);
      
      // 记录信号
      const gravityEvent = {
        time: currentTime,
        direction: newDirection,
        x: newGravityX,
        y: newGravityY,
        playerPos: { x: Math.round(player.x), y: Math.round(player.y) }
      };
      
      window.__signals__.gravityChanges.push(gravityEvent);
      window.__signals__.currentGravity = {
        x: newGravityX,
        y: newGravityY,
        direction: newDirection
      };
      
      console.log(`[GRAVITY_CHANGE] ${JSON.stringify(gravityEvent)}`);
    }
  }
  
  // 更新玩家位置信号（每秒记录一次）
  if (Math.floor(time / 1000) !== Math.floor((time - delta) / 1000)) {
    window.__signals__.playerPosition = {
      x: Math.round(player.x),
      y: Math.round(player.y),
      velocityX: Math.round(player.body.velocity.x),
      velocityY: Math.round(player.body.velocity.y)
    };
  }
  
  // 添加视觉反馈：根据速度改变玩家颜色
  const speed = Math.sqrt(
    player.body.velocity.x ** 2 + player.body.velocity.y ** 2
  );
  const colorIntensity = Math.min(speed / 300, 1);
  player.setTint(Phaser.Display.Color.GetColor(
    0,
    212 * (1 - colorIntensity) + 255 * colorIntensity,
    255
  ));
}

new Phaser.Game(config);