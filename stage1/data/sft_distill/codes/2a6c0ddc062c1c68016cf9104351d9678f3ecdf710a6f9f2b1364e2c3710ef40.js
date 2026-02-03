const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 状态变量（可验证）
let dashCount = 0; // 冲刺次数
let canDash = true; // 是否可以冲刺
let cooldownRemaining = 0; // 剩余冷却时间

let player;
let cursors;
let statusText;
let cooldownTimer;

const DASH_SPEED = 160 * 3; // 480
const DASH_DURATION = 200; // 冲刺持续时间（毫秒）
const DASH_COOLDOWN = 2000; // 冷却时间（毫秒）
const NORMAL_SPEED = 160;

function preload() {
  // 创建红色角色纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建玩家角色
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  
  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 监听鼠标左键点击
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      performDash.call(this, pointer);
    }
  });
  
  // 创建状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  updateStatusText();
}

function update(time, delta) {
  // 基础移动控制
  if (!player.getData('isDashing')) {
    player.setVelocity(0);
    
    if (cursors.left.isDown) {
      player.setVelocityX(-NORMAL_SPEED);
    } else if (cursors.right.isDown) {
      player.setVelocityX(NORMAL_SPEED);
    }
    
    if (cursors.up.isDown) {
      player.setVelocityY(-NORMAL_SPEED);
    } else if (cursors.down.isDown) {
      player.setVelocityY(NORMAL_SPEED);
    }
  }
  
  // 更新冷却时间显示
  if (!canDash && cooldownTimer) {
    cooldownRemaining = Math.max(0, cooldownTimer.getRemaining());
    updateStatusText();
  }
}

function performDash(pointer) {
  if (!canDash) {
    console.log('冲刺冷却中...');
    return;
  }
  
  // 计算从玩家到鼠标点击位置的方向
  const dx = pointer.x - player.x;
  const dy = pointer.y - player.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < 1) return; // 避免除以零
  
  // 归一化方向向量
  const dirX = dx / distance;
  const dirY = dy / distance;
  
  // 应用冲刺速度
  player.setVelocity(dirX * DASH_SPEED, dirY * DASH_SPEED);
  player.setData('isDashing', true);
  
  // 增加冲刺计数
  dashCount++;
  canDash = false;
  
  // 冲刺持续时间后恢复正常速度
  this.time.delayedCall(DASH_DURATION, () => {
    player.setData('isDashing', false);
  });
  
  // 冷却计时器
  cooldownTimer = this.time.addEvent({
    delay: DASH_COOLDOWN,
    callback: () => {
      canDash = true;
      cooldownRemaining = 0;
      cooldownTimer = null;
      updateStatusText();
      console.log('冲刺已就绪');
    }
  });
  
  updateStatusText();
  console.log(`冲刺！次数: ${dashCount}`);
}

function updateStatusText() {
  const cooldownText = canDash 
    ? '就绪' 
    : `冷却中: ${(cooldownRemaining / 1000).toFixed(1)}s`;
  
  statusText.setText([
    `冲刺次数: ${dashCount}`,
    `冲刺状态: ${cooldownText}`,
    `位置: (${Math.round(player.x)}, ${Math.round(player.y)})`,
    '',
    '操作说明:',
    '- 方向键移动',
    '- 鼠标左键冲刺'
  ]);
}

const game = new Phaser.Game(config);