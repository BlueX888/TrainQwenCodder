const SEED = 12345; // 固定种子，可修改测试

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  seed: [SEED], // 设置全局随机种子
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 初始化随机数生成器，确保使用固定种子
  this.game.config.seed = [SEED];
  Phaser.Math.RND.init([SEED]);
  
  // 存储障碍物信息用于验证
  const obstacles = [];
  
  // 生成 10 个黄色障碍物
  const OBSTACLE_COUNT = 10;
  const MARGIN = 50; // 边界留白
  const MIN_SIZE = 30;
  const MAX_SIZE = 80;
  
  for (let i = 0; i < OBSTACLE_COUNT; i++) {
    // 使用确定性随机生成位置和大小
    const x = Phaser.Math.RND.between(MARGIN, config.width - MARGIN);
    const y = Phaser.Math.RND.between(MARGIN, config.height - MARGIN);
    const width = Phaser.Math.RND.between(MIN_SIZE, MAX_SIZE);
    const height = Phaser.Math.RND.between(MIN_SIZE, MAX_SIZE);
    
    // 创建 Graphics 对象绘制障碍物
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFFF00, 1); // 黄色
    graphics.fillRect(x - width / 2, y - height / 2, width, height);
    
    // 添加边框使障碍物更清晰
    graphics.lineStyle(2, 0xFFCC00, 1);
    graphics.strokeRect(x - width / 2, y - height / 2, width, height);
    
    // 记录障碍物信息
    obstacles.push({
      id: i,
      x: x,
      y: y,
      width: width,
      height: height
    });
  }
  
  // 显示当前 seed
  const seedText = this.add.text(10, 10, `Seed: ${SEED}`, {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  seedText.setDepth(100); // 确保文本在最上层
  
  // 显示障碍物数量
  const countText = this.add.text(10, 50, `Obstacles: ${OBSTACLE_COUNT}`, {
    fontSize: '20px',
    color: '#FFFF00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  countText.setDepth(100);
  
  // 显示提示信息
  const infoText = this.add.text(10, 90, 'Same seed = Same layout', {
    fontSize: '16px',
    color: '#aaaaaa',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  infoText.setDepth(100);
  
  // 输出可验证的 signals
  window.__signals__ = {
    seed: SEED,
    obstacleCount: OBSTACLE_COUNT,
    obstacles: obstacles,
    timestamp: Date.now(),
    layoutHash: generateLayoutHash(obstacles)
  };
  
  // 控制台输出便于验证
  console.log('=== Deterministic Generation Test ===');
  console.log('Seed:', SEED);
  console.log('Obstacles:', obstacles);
  console.log('Layout Hash:', window.__signals__.layoutHash);
  console.log('=====================================');
}

// 生成布局哈希用于快速验证布局一致性
function generateLayoutHash(obstacles) {
  let hash = 0;
  obstacles.forEach(obs => {
    hash += obs.x * 1000 + obs.y * 100 + obs.width * 10 + obs.height;
  });
  return Math.floor(hash);
}

// 启动游戏
const game = new Phaser.Game(config);

// 提供修改 seed 的接口用于测试
window.regenerateWithSeed = function(newSeed) {
  game.destroy(true);
  const newConfig = { ...config, seed: [newSeed] };
  window.SEED = newSeed;
  location.reload(); // 简单重载，实际项目中可以重启 scene
};