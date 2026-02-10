// 完整的 Phaser3 代码 - 角色受伤效果（闪烁+击退）
const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
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
  },
  seed: [(Date.now() * Math.random()).toString()]
};

// 全局信号对象
window.__signals__ = {
  hitCount: 0,
  isInvincible: false,
  playerHealth: 100,
  lastHitTime: 0,
  knockbackApplied: false,
  events: []
};

let player;
let enemy;
let cursors;
let isHurt = false;
let hurtEndTime = 0;
let blinkTween;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建紫色玩家角色纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x9933ff, 1); // 紫色
  playerGraphics.fillCircle(25, 25, 25);
  playerGraphics.generateTexture('playerTex', 50, 50);
  playerGraphics.destroy();

  // 创建红色敌人纹理
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff3333, 1); // 红色
  enemyGraphics.fillRect(0, 0, 40, 40);
  enemyGraphics.generateTexture('enemyTex', 40, 40);
  enemyGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'playerTex');
  player.setCollideWorldBounds(true);
  player.body.setCircle(25);

  // 创建敌人精灵（可移动的敌人）
  enemy = this.physics.add.sprite(600, 300, 'enemyTex');
  enemy.setVelocity(-50, 0); // 敌人向左移动

  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, handleCollision, null, this);

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加文本显示状态
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 记录初始化事件
  window.__signals__.events.push({
    type: 'init',
    time: this.time.now,
    playerPos: { x: player.x, y: player.y }
  });

  console.log('[Game Init] Player and enemy created');
}

function handleCollision(player, enemy) {
  // 如果已经在受伤状态，不重复触发
  if (isHurt) {
    return;
  }

  const scene = player.scene;
  
  // 标记受伤状态
  isHurt = true;
  hurtEndTime = scene.time.now + 3000; // 3秒后结束
  
  // 更新信号
  window.__signals__.hitCount++;
  window.__signals__.isInvincible = true;
  window.__signals__.playerHealth -= 10;
  window.__signals__.lastHitTime = scene.time.now;
  window.__signals__.knockbackApplied = true;

  // 记录碰撞事件
  window.__signals__.events.push({
    type: 'collision',
    time: scene.time.now,
    playerPos: { x: player.x, y: player.y },
    enemyPos: { x: enemy.x, y: enemy.y },
    hitCount: window.__signals__.hitCount
  });

  console.log(`[Collision] Hit #${window.__signals__.hitCount} at time ${scene.time.now}`);

  // 计算击退方向（从敌人指向玩家）
  const knockbackSpeed = 120;
  const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
  const knockbackX = Math.cos(angle) * knockbackSpeed;
  const knockbackY = Math.sin(angle) * knockbackSpeed;

  // 应用击退效果
  player.setVelocity(knockbackX, knockbackY);

  // 记录击退数据
  window.__signals__.events.push({
    type: 'knockback',
    time: scene.time.now,
    velocity: { x: knockbackX, y: knockbackY },
    angle: angle
  });

  console.log(`[Knockback] Applied velocity: (${knockbackX.toFixed(2)}, ${knockbackY.toFixed(2)})`);

  // 实现闪烁效果（3秒内循环闪烁）
  if (blinkTween) {
    blinkTween.stop();
  }

  blinkTween = scene.tweens.add({
    targets: player,
    alpha: 0.3,
    duration: 150,
    yoyo: true,
    repeat: -1, // 无限循环
    onStart: () => {
      console.log('[Blink] Started at time', scene.time.now);
    }
  });

  // 3秒后停止闪烁并恢复无敌状态
  scene.time.delayedCall(3000, () => {
    isHurt = false;
    window.__signals__.isInvincible = false;
    window.__signals__.knockbackApplied = false;
    
    if (blinkTween) {
      blinkTween.stop();
      player.alpha = 1; // 恢复完全不透明
    }

    window.__signals__.events.push({
      type: 'recovery',
      time: scene.time.now,
      playerPos: { x: player.x, y: player.y }
    });

    console.log('[Recovery] Invincibility ended at time', scene.time.now);
  });
}

function update(time, delta) {
  // 玩家移动控制（只在非受伤状态下可控制）
  if (!isHurt) {
    player.setVelocity(0);

    if (cursors.left.isDown) {
      player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);
    }

    if (cursors.up.isDown) {
      player.setVelocityY(-160);
    } else if (cursors.down.isDown) {
      player.setVelocityY(160);
    }
  } else {
    // 受伤状态下，击退速度逐渐衰减
    player.setVelocity(player.body.velocity.x * 0.95, player.body.velocity.y * 0.95);
  }

  // 敌人边界反弹
  if (enemy.x < 40 || enemy.x > 760) {
    enemy.setVelocityX(-enemy.body.velocity.x);
  }

  // 更新状态文本
  if (this.statusText) {
    this.statusText.setText([
      `Hit Count: ${window.__signals__.hitCount}`,
      `Health: ${window.__signals__.playerHealth}`,
      `Invincible: ${window.__signals__.isInvincible}`,
      `Player: (${Math.floor(player.x)}, ${Math.floor(player.y)})`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);
  }
}

// 启动游戏
const game = new Phaser.Game(config);

// 导出验证函数
window.getGameState = function() {
  return {
    signals: window.__signals__,
    playerPos: player ? { x: player.x, y: player.y } : null,
    enemyPos: enemy ? { x: enemy.x, y: enemy.y } : null,
    isHurt: isHurt
  };
};

console.log('[Game] Initialized. Use arrow keys to move player. Collide with red enemy to trigger hurt effect.');
console.log('[Game] Access window.__signals__ to view game state and events.');